(function () {
    'use strict';

    Peerio.UI.VScroll = React.createClass({
        propTypes: {
            // amount of items loaded
            pageCount: React.PropTypes.number,

            // loading margin 
            loadMargin: React.PropTypes.number,

            /**
             * Get the next page of elements
             * @param lastElement last loaded element (can be null)
             * @param count amount of items requested 
             * @returns collection of elements suitable for onRenderItem
             **/
            onGetPage: React.PropTypes.func.isRequired,

            /**
             * Gets item id 
             * @param item current item to check 
             **/
            onGetItemId: React.PropTypes.func.isRequired,

            /**
             * Renders item 
             * @param item current item to render 
             **/
            onRenderItem: React.PropTypes.func.isRequired
        },

        // is current loading in progress flag
        loading: false,

        getDefaultProps: function() {
            return {
                // number of items loaded per page
                pageCount: 10,
                lastPageZeroLength: false
            };
        },

        getInitialState: function () {
            return {
                items: []
            };
        },

        getLastItem: function() {
            if( this.state.items.length > 0 ) {
                return this.state.items[this.state.items.length - 1];
            }
        },

        hasMoreItems: function() {
            return !this.state.lastPageZeroLength;
        },

        // hash table to check if the item is already loaded
        itemsHash: {},

        loadNextPageStateAware: function() {
            if(this.loading) return;
            if(!this.hasMoreItems()) return;
            this.loading = true;

            window.setTimeout( () => {
            this.props.onGetPage(
                this.getLastItem(), this.props.pageCount)
                .then( (itemsPage) => {
                    var items = this.state.items;
                    var newItems = false;
                    for(var i = 0; i < itemsPage.length; ++i) {
                        var item = itemsPage[i];
                        var key = this.props.onGetItemId(item);
                        if(this.itemsHash.hasOwnProperty( key )) continue;

                        newItems = true;
                        this.itemsHash[key] = item;
                        items.push(item);
                    }

                    this.setState( {
                        items: items,
                        lastPageZeroLength: !newItems 
                    });
                    this.loading = false;
                });
            }, 500);
        },

        componentWillMount: function () {
            this.loadNextPageStateAware();
        },
        
        onscroll: function (ev) {
           if ((ev.target.scrollHeight - ev.target.clientHeight - ev.target.scrollTop) > 30) {
               // console.log('scroll more');
                return;
            }
            this.loadNextPageStateAware();
        },

        render: function () {
            var nodes = this.state.items ? this.renderNodes(this.state.items) : null;
            var loader = this.hasMoreItems() ? (
                <div className="text-center"><i className="fa fa-circle-o-notch fa-spin"></i></div>
            ) : null;

            return (
				<div className="content list-view" id="Messages" onScroll={this.onscroll}>
                    {nodes}
                    {loader}
				</div>
            );
        },

        renderNodes: function (items) {
            return items.map(this.props.onRenderItem);
        }
    });
}());
