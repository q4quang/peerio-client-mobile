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
                // if the last oage request yielded a
                // result.length < pageSize
                lastPageZeroLength: false,
                // is current loading in progress flag
                loading: false,
                // if we deleted top items in our virtual scroll,
                // save the topmost item timestamp here
                upperItem: null
            };
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
            if (! (this.hasMoreItems() || this.hasHiddenItems()) ) return;
            this.loading = true;

            onGetPage().then(itemsPage => {
                    var items = this.state.items;

                    var upperItem = this.state.upperItem;

                    for (var i = 0; i < itemsPage.length; ++i) {
                        var item = itemsPage[i];
                        var key = item[this.props.itemKeyName];

                        var existingItem = this.itemsHash[key];
                        if (existingItem) {
                            // same item - paging collision
                            if (item.seqID === existingItem.seqID)
                                continue;
                            // same item but updated, removing stale item
                            items.splice(items.indexOf(existingItem), 1);
                        }

                        this.itemsHash[key] = item;
                        append ? items.push(item) : items.splice(0, 0, item);
                    }
                    // let the user scroll two screens before removing items
                    var renderedItemsLimit = this.props.pageCount * 2; 

                    // remember the current top item to scroll into it
                    if(!append && upperItem) {
                        this.scrollIntoItem = upperItem[this.props.itemKeyName];    
                    } else {
                        this.scrollIntoItem = null;
                    }

                    if( items.length > renderedItemsLimit ) {
                        var start = append ? items.length - renderedItemsLimit : 0;
                        var take = renderedItemsLimit;
                        items = items.slice(start, take);
                        upperItem = items[0];
                    }

                    // update hash accordingly 
                    this.itemsHash = [];
                    for(var i = 0; i < items.length; ++i) {
                        var item = items[i];
                        this.itemsHash[item[this.props.itemKeyName]] = item;
                    }
                   
                    // horrible
                    if( !append && this.props.reverse ) {
                        upperItem = items[0];
                    }
                    this.setState({
                        upperItem: 
                            append || (itemsPage.length >= this.props.pageCount) ? upperItem : null,
                        items: items,
                        // we do not account for duplicates here, cause the only time
                        // it would mean something is the rare occasion when the last
                        // element has duplicate right before him
                        lastPageZeroLength: append && (itemsPage.length < this.props.pageCount)
                    }, ()=> {
                        this.loading = false;
                        
                   });

                });
        },

        loadPrevPageStateAware: function () {
            this.loadPageStateAware( false,  
                                    () => { return this.props.onGetPrevPage(
                                        this.getFirstItem(), this.props.pageCount); 
                                    });
        },

        loadNextPageStateAware: function () {
            this.loadPageStateAware( true,  
                                    () => { return this.props.onGetPage(
                                        this.getLastItem(), this.props.pageCount); } );
        },

        componentDidUpdate: function() {
            if(this.scrollIntoItem) {
                this.refs[this.scrollIntoItem].getDOMNode().scrollIntoView();
                this.scrollIntoItem = null;
            }

            // we should scrol after the initial page load
            if((Object.keys(this.itemsHash).length > 0) && !this.alreadyUpdated && this.props.reverse) {
                var scrollContainer = this.refs['vscroll'].getDOMNode();
                scrollContainer.scrollTop = scrollContainer.scrollHeight;
                this.alreadyUpdated = true;
            }
        },

        componentWillMount: function () {
            this.itemsHash = {};
            this.props.reverse ? 
                this.loadPrevPageStateAwareThrottled() :
                this.loadNextPageStateAwareThrottled();
        },

        onscroll: function (ev) {
            // thirty is a magic number which was calculated
            // using virgin's blood and a pair of Mayan dice
            if( (ev.target.scrollHeight - ev.target.clientHeight - ev.target.scrollTop) <= 30) {
                this.loadNextPageStateAware();
            }

            if( ev.target.scrollTop == 0) {
                this.loadPrevPageStateAware();
            }
        },

        render: function () {
            var nodes = this.state.items ? this.renderNodes(this.state.items) : null;

            var loaderTop = this.hasHiddenItems() ? (<div className="list-item">
                <span className="fa fa-circle-o-notch fa-spin" style={{margin:'auto',color: '#278FDA'}}></span>
            </div>) : null;

            var loader = this.hasMoreItems() ? (<div className="list-item">
                <span className="fa fa-circle-o-notch fa-spin" style={{margin:'auto',color: '#278FDA'}}></span>
            </div>) : null;

            return (
                <div 
                className={this.props.className}
                id="vscroll"
                ref="vscroll" 
                onScroll={this.onscroll}>
                    {loaderTop}
                    {nodes}
                    {loader}
                </div>
            );
        },

        renderNodes: function (items) {
            return items.map( (item, index, array) => {
                return React.createElement(this.props.itemComponent,
                                           {key: item[this.props.itemKeyName], 
                                               ref: item[this.props.itemKeyName], 
                                               item: item,
                                               index: index,
                                               prevItem: index > 0 ? array[index-1] : false,
                                               itemParentData: this.props.itemParentData});
            });
        }
    });
}());
