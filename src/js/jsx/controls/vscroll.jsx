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
                items: [],
                noMoreBottomItems: this.props.reverse,
                upperItem: this.props.reverse
            };
        },

        getDefaultProps: function () {
            return {
                // number of items loaded per page
                pageCount: 20
           };
        },

        // is current loading in progress flag
        loading: false,

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
                    if(!item) return;
                    item = item.className != 'bottomScrollHook' && !this.scrollIntoItem.alignToTop && 
                        item.nextSibling && item.nextSibling.className == 'bottomScrollHook' ? item.nextSibling : item;
                    if (item) {
                        item.scrollIntoView(this.scrollIntoItem.alignToTop,{behavior: 'smooth'});
                        var greenButton = document.getElementById('greenButton');
                        greenButton && greenButton.scrollIntoView(false, {behaviour: 'smooth'});
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

        scrollToBottom: function() {
            this.refs.bottomScrollHook.getDOMNode().scrollIntoView(false, {behaviour: 'smooth'});
        },
        
        reset: function() {
//            this.setState( this.getInitialState(), () => this.componentWillMount() );
        },
        // parent component calls this
        refresh: function (callback) {

            if (this.loading) this.doRefresh = true;
            // we block auto scrolling into last view item
            this.scrollIntoItem = null;
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
            // plus one here is to take care of an updated convo list (it increases seqID)
            this.props.onGetItemsRange(this.getLastItem().seqID, this.getFirstItem().seqID + 1)
                .then(items=> {
                    this.itemsHash = {};
                    for (var i = 0; i < items.length; i++) {
                        this.itemsHash[items[i][this.props.itemKeyName]] = items[i];
                    }
                    this.setState({
                        items: items,
                        upperItem: items.length && items[0] || null
                    }, () => {
                        this.loading = false;
                        if(callback)callback();
                    });
                });
        },

        // parent component calls this
        deleteItems: function (deleteItems) {
            var items = this.state.items;

            for (var i = 0; i < items.length; i++) {
                var key = items[i][this.props.itemKeyName];
                var existing = this.itemsHash[key];
                if (!existing) continue;
                if(deleteItems.indexOf(key) != -1) {
                    items.splice(items.indexOf(existing), 1);
                    delete this.itemsHash[key];
                }
            }
            this.setState({
                items: items,
                upperItem: items.length && items[0] || null
            }, () => this.loading = false);

            return items.length;
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
            return !this.state.noMoreBottomItems;
        },

        loadPage: function (append, onGetPage) {
            if (this.loading) return;
            if (append && !this.hasMoreItemsBottom()) return;
            if (!append && !this.hasMoreItemsTop()) return;
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

                var noMoreBottomItems = this.state.noMoreBottomItems;

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
                    noMoreBottomItems = false;
                }

                // horrible
                if (!append && this.props.reverse) {
                    upperItem = items[0];
                }

                noMoreBottomItems = append && (itemsPage.length < this.props.pageCount) || noMoreBottomItems;

                this.setState({
                    upperItem: append || (itemsPage.length >= this.props.pageCount) ? upperItem : null,
                    items: items,
                    noMoreBottomItems: noMoreBottomItems
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

        loadNextPage: function (force) {
            var call = function() {
                return this.loadPage(true,
                              () => this.props.onGetPage(
                    this.getLastItem(), this.props.pageCount));
            }.bind(this);

            if(force) {
                this.scrollIntoItem = null;
                this.setState({ noMoreBottomItems: false }, () => call());
            } else {
                call();
            }
        },

        onscroll: function () {
            var node = this.refs.vscroll.getDOMNode();
            // thirty is a magic number which was calculated
            // using virgin's blood and a pair of Mayan dice
            if ((node.scrollHeight - node.clientHeight - node.scrollTop) < 30) {
                this.loadNextPage();
            }

            if (node.scrollTop < 30) {
                this.loadPrevPage();
            }
        },
        spinner: (<div className="list-item loader-item"><span className="fa fa-circle-o-notch fa-spin"></span></div>),

        render: function () {
            var nodes = this.state.items ? this.renderNodes(this.state.items) : null;

            var loaderTop = this.hasMoreItemsTop() ? this.spinner : null;

            var loader = this.hasMoreItemsBottom() ? this.spinner : null;

            var bottomScrollHook = (<div className="bottomScrollHook" ref="bottomScrollHook"></div>);

            return (
                <div className={'vscroll ' + this.props.className} id="vscroll" ref="vscroll">
                    {loaderTop}
                    {nodes}
                    {bottomScrollHook}
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
