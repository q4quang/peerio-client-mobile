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

        getDefaultProps: function () {
            return {
                // number of items loaded per page
                pageCount: 20,
                lastPageZeroLength: false,
                // is current loading in progress flag
                loading: false
                // hash table to check if the item is already loaded
            };
        },

        itemsHash: {},

        getInitialState: function () {
            this.loadNextPageStateAwareThrottled = _.throttle(this.loadNextPageStateAware, 1000, {trailing: false});
            return {
                items: []
            };
        },

        getLastItem: function () {
            var i = this.state.items;
            return i.length > 0 ? i[i.length - 1] : null;
        },

        hasMoreItems: function () {
            return !this.state.lastPageZeroLength;
        },

        loadNextPageStateAware: function () {
            if (this.loading) return;
            if (!this.hasMoreItems()) return;
            this.loading = true;

            this.props.onGetPage(this.getLastItem(), this.props.pageCount)
                .then(itemsPage => {
                    var items = this.state.items;
                    var modified = false;
                    for (var i = 0; i < itemsPage.length; ++i) {
                        var item = itemsPage[i];
                        var key = item[this.props.itemKeyName];

                        var existingItem = this.itemsHash[key];
                        if (existingItem) {
                            // same item - paging collision
                            if (item.lastTimestamp === existingItem.lastTimestamp)
                                continue;
                            // same item but updated, removing stale item
                            items.splice(items.indexOf(existingItem), 1);
                        }

                        this.itemsHash[key] = item;
                        items.push(item);
                        modified = true;
                    }

                    this.setState({
                        items: items,
                        lastPageZeroLength: !modified
                    }, ()=> {
                        this.loading = false;
                    });

                });
        },

        componentWillMount: function () {
            this.itemsHash = {};
            this.loadNextPageStateAwareThrottled();
        },

        onscroll: function (ev) {
            if (this.loading || (ev.target.scrollHeight - ev.target.clientHeight - ev.target.scrollTop) > 30) {
                return;
            }
            this.loadNextPageStateAware();
        },

        render: function () {
            var nodes = this.state.items ? this.renderNodes(this.state.items) : null;

            var loader = this.hasMoreItems() ? (<div className="list-item">
                <span className="fa fa-circle-o-notch fa-spin" style={{margin:'auto',color: '#278FDA'}}></span>
            </div>) : null;

            return (
                <div className="content list-view" id="Messages" ref="messages" onScroll={this.onscroll}>
                    {nodes}
                    {loader}
                </div>
            );
        },

        renderNodes: function (items) {
            return items.map(item=> {
                return React.createElement(this.props.itemComponent, {key: item[this.props.itemKeyName], item: item});
            });
        }
    });
}());
