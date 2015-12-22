(function () {
    'use strict';

    Peerio.UI.VScroll = React.createClass({
        propTypes: {
            // amount of items loaded
            pageCount: React.PropTypes.number,
            // loading margin 
            loadMargin: React.PropTypes.number,
            // item property name, representing unique item key
            itemKeyName: React.PropTypes.string
        },
        // hash table to check if the item is already loaded
        itemsHash: {},

        getInitialState: function () {
            this.loadNextPageStateAwareThrottled = _.throttle(this.loadNextPageStateAware, 1000, {trailing: false});
            this.loadPrevPageStateAwareThrottled = _.throttle(this.loadPrevPageStateAware, 1000, {trailing: false});
            return {
                items: []
            };
        },

        getDefaultProps: function () {
            return {
                // number of items loaded per page
                pageCount: 20,
                // if the last oage request yielded a
                // result.length < pageSize
                lastPageZeroLength: false,
                // is current loading in progress flag
                loading: false,
                // if we deleted top items in our virtual scroll,
                // save the topmost item
                upperItem: null
            };
        },

        componentWillReceiveProps: function (nextProps) {
            this.renderedItemsLimit = nextProps.pageCount * 2;
        },

        componentWillMount: function () {
            this.itemsHash = {};
            this.props.reverse ?
                this.loadPrevPageStateAwareThrottled() :
                this.loadNextPageStateAwareThrottled();
            this.renderedItemsLimit = this.props.pageCount * 2;
        },

        componentDidUpdate: function () {
            if (this.scrollIntoItem) {
                this.refs[this.scrollIntoItem].getDOMNode().scrollIntoView();
                this.scrollIntoItem = null;
            }

            // we should scrol after the initial page load
            if ((Object.keys(this.itemsHash).length > 0) && !this.alreadyUpdated && this.props.reverse) {
                var scrollContainer = this.refs['vscroll'].getDOMNode();
                scrollContainer.scrollTop = scrollContainer.scrollHeight;
                this.alreadyUpdated = true;
            }
        },

        // parent component calls this
        refreshPage: function () {

        },
        // parent component calls this
        deleteItems: function (items) {

        },

        getFirstItem: function () {
            var i = this.state.items;
            return i.length > 0 ? i[0] : null;
        },

        getLastItem: function () {
            var i = this.state.items;
            return i.length > 0 ? i[i.length - 1] : null;
        },

        hasHiddenItems: function () {
            return this.state.upperItem != null;
        },

        hasMoreItems: function () {
            return !this.state.lastPageZeroLength;
        },

        loadPageStateAware: function (append, onGetPage) {
            if (this.loading) return;
            if (!(this.hasMoreItems() || this.hasHiddenItems())) return;
            this.loading = true;

            onGetPage().then(itemsPage => {
                var items = this.state.items;
                var i, item;
                var upperItem = this.state.upperItem;

                for (i = 0; i < itemsPage.length; ++i) {
                    item = itemsPage[i];
                    var key = item[this.props.itemKeyName];

                    var existingItem = this.itemsHash[key];
                    if (existingItem) {
                        // updated item received, removing stale item
                        items.splice(items.indexOf(existingItem), 1);
                    }

                    this.itemsHash[key] = item;
                    append ? items.push(item) : items.unshift(item);
                }

                // remember the current top item to scroll into it
                this.scrollIntoItem = !append && upperItem ? upperItem[this.props.itemKeyName] : null;

                // need to remove excessive elements
                if (items.length > this.renderedItemsLimit) {
                    // will delete this much
                    var deleteCount = items.length - this.renderedItemsLimit;
                    // removing from items array
                    var deleted = items.splice(append ? 0 : -deleteCount, deleteCount);
                    // removing from hash
                    for (i = 0; i < deleted.length; i++)
                        delete this.itemsHash[deleted[i][this.props.itemKeyName]];

                    upperItem = items[0];
                }

                // horrible
                if (!append && this.props.reverse) {
                    upperItem = items[0];
                }

                this.setState({
                    upperItem: append || (itemsPage.length >= this.props.pageCount) ? upperItem : null,
                    items: items,
                    lastPageZeroLength: append && (itemsPage.length < this.props.pageCount) || (items.length < this.props.pageCount)
                }, () => this.loading = false);

            });
        },

        loadPrevPageStateAware: function () {
            this.loadPageStateAware(false,
                () => {
                    return this.props.onGetPrevPage(
                        this.getFirstItem(), this.props.pageCount);
                });
        },

        loadNextPageStateAware: function () {
            this.loadPageStateAware(true,
                () => {
                    return this.props.onGetPage(
                        this.getLastItem(), this.props.pageCount);
                });
        },


        onscroll: function (ev) {
            // thirty is a magic number which was calculated
            // using virgin's blood and a pair of Mayan dice
            if ((ev.target.scrollHeight - ev.target.clientHeight - ev.target.scrollTop) <= 30) {
                this.loadNextPageStateAware();
            }

            if (ev.target.scrollTop == 0) {
                this.loadPrevPageStateAware();
            }
        },

        render: function () {
            var nodes = this.state.items ? this.renderNodes(this.state.items) : null;

            var loaderTop = this.hasHiddenItems() ? (<div className="list-item loader-item">
                <span className="fa fa-circle-o-notch fa-spin"></span>
            </div>) : null;

            var loader = this.hasMoreItems() ? (<div className="list-item loader-item">
                <span className="fa fa-circle-o-notch fa-spin"></span>
            </div>) : null;

            return (
                <div className={'vscroll ' + this.props.className} id="vscroll" ref="vscroll" onScroll={this.onscroll}>
                    {loaderTop}
                    {nodes}
                    {loader}
                </div>
            );
        },

        renderNodes: function (items) {
            return items.map((item, index, array) => {
                return React.createElement(this.props.itemComponent,
                    {
                        key: item[this.props.itemKeyName],
                        ref: item[this.props.itemKeyName],
                        item: item,
                        index: index,
                        prevItem: index > 0 ? array[index - 1] : false,
                        itemParentData: this.props.itemParentData
                    });
            });
        }
    });
}());
