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
             * Tests if there are some more items available to load
             * @param lastElement last loaded element (can be null
             * @returns bool
             **/
            onHasMoreItems: React.PropTypes.func.isRequired,

             /**
             * Tests if there are some more items available to load
             * @param lastElement last loaded element (can be null
             **/
            onRenderItem: React.PropTypes.func.isRequired
        },

        // is current loading in progress flag
        loading: false,

        getDefaultProps: function() {
            return {
                // number of items loaded per page
                pageCount: 10
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
            return this.props.onHasMoreItems(this.getLastItem());
        },

        loadNextPageStateAware: function() {
            if(this.loading) return;
            if(!this.hasMoreItems()) return;
            this.loading = true;

            var timeout = window.setTimeout( () => {
                var itemsPage = 
                    this.props.onGetPage(
                        this.getLastItem(), this.props.pageCount);
                var items = this.state.items.concat(itemsPage);
                this.setState( {
                    items: items
                });
                this.loading = false;
            }, 1000);
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
