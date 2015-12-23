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

        componentDidMount: function () {
            this.updateScroll = window.setInterval(() => {
                if (!this.isMounted()) return;
                this.onscroll();
            }, 1000);
        },

        componentWillUnmount: function () {
            if (this.updateScroll) {
                window.clearInterval(this.updateScroll);
                this.updateScroll = null;
            }
        },

        componentWillMount: function () {
            this.itemsHash = {};
            this.props.reverse ?
                this.loadPrevPage() :
                this.loadNextPage();
            this.renderedItemsLimit = this.props.pageCount * 2;
        },

        componentDidUpdate: function () {
            if (this.scrollIntoItem) {
                var item = this.refs[this.scrollIntoItem.key];
                if (item) {
                    item = item.getDOMNode();
                    item = this.scrollIntoItem.alignToTop ? item.previousSibling : item.nextSibling;
                    if (item) {
                        item.scrollIntoView(this.scrollIntoItem.alignToTop, {behavior: "smooth"});
                    }
                }
                this.scrollIntoItem = null;
            }

            // we should scroll after the initial page load
            if ((Object.keys(this.itemsHash).length > 0) && !this.alreadyUpdated && this.props.reverse) {
                var scrollContainer = this.refs.vscroll.getDOMNode();
                scrollContainer.scrollTop = scrollContainer.scrollHeight;
                this.alreadyUpdated = true;
            }
        },

        // parent component calls this
        refresh: function () {

            if (this.loading) this.doRefresh = true;
            this.loading = true;
            this.doRefresh = false;
            // in case view was empty there is nothing to refresh, we load page as usual
            if (this.state.items.length === 0) {
                this.loading = false;
                this.props.reverse ?
                    this.loadPrevPage() :
                    this.loadNextPage();
                return;
            }

            this.props.onGetItemsRange(this.getFirstItem().seqID, this.getLastItem().seqID)
                .then(items=> {
                    this.itemsHash = {};
                    for (var i = 0; i < items.length; i++) {
                        this.itemsHash[items[i][this.props.itemKeyName]] = items[i];
                    }
                    this.setState({
                        items: items,
                        upperItem: items.length && items[0] || null
                    }, () => this.loading = false);
                })
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

        hasMoreItemsTop: function () {
            return this.state.upperItem != null;
        },

        hasMoreItemsBottom: function () {
            return !this.state.lastPageZeroLength;
        },

        loadPage: function (append, onGetPage) {
            if (this.loading) return;
            if (!(this.hasMoreItemsBottom() || this.hasMoreItemsTop())) return;
            this.loading = true;

            onGetPage().then(itemsPage => {
                var items = this.state.items;
                var i, item;
                var firstItem = this.state.items.length > 0 ?
                    this.state.items[0] : null;
                var lastItem = this.state.items.length > 0 ?
                    this.state.items[this.state.items.length - 1] : null;
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
                this.scrollIntoItem = null;

                if (append) {
                    this.scrollIntoItem = lastItem ? {
                        key: lastItem[this.props.itemKeyName], alignToTop: false
                    } : null;
                } else {
                    this.scrollIntoItem = firstItem ? {
                        key: firstItem[this.props.itemKeyName], alignToTop: true
                    } : null;
                }

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
                }, () => {
                    this.loading = false;
                    this.doRefresh && this.refresh();
                });

            });
        },

        loadPrevPage: function () {
            this.loadPage(false,
                () => {
                    return this.props.onGetPrevPage(
                        this.getFirstItem(), this.props.pageCount);
                });
        },

        loadNextPage: function () {
            this.loadPage(true,
                () => {
                    return this.props.onGetPage(
                        this.getLastItem(), this.props.pageCount);
                });
        },

        onscroll: function () {
            var node = this.refs.vscroll.getDOMNode();
            // thirty is a magic number which was calculated
            // using virgin's blood and a pair of Mayan dice
            if ((node.scrollHeight - node.clientHeight - node.scrollTop) < 30) {
                this.loadNextPage();
            }

            if (node.scrollTop == 0) {
                this.loadPrevPage();
            }
        },
        spinner: (<div className="list-item loader-item"><span className="fa fa-circle-o-notch fa-spin"></span></div>),

        render: function () {
            var nodes = this.state.items ? this.renderNodes(this.state.items) : null;

            var loaderTop = this.hasMoreItemsTop() ? this.spinner : null;

            var loader = this.hasMoreItemsBottom() ? this.spinner : null;

            return (
                <div className={'vscroll ' + this.props.className} id="vscroll" ref="vscroll">
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
