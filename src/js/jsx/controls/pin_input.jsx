(function () {
    'use strict';

    Peerio.UI.PinInput = React.createClass({
        mixins: [Peerio.UI.AutoFocusMixin],

        getDefaultProps: function() {
            return {
                'data-password': 'yes'
            };
        },

        render: function () {
           return (
              //  <input
              //    {...this.props}
              //    type="number"
              //    inputMode="numeric"
              //    pattern="[0-9]*"
              //    maxLength="256"
              //    autoComplete="off"
              //    autoCorrect="off"
              //    autoCapitalize="off"
              //  spellCheck="false"/>

               <div className="modal pin-pad flex-col flex-justify-center">

                 <div className="headline-md text-center margin-small padding-small text-overflow">
                   Welcome back <strong>UX</strong>
                 </div>

                 <div className="pin-code pin-code flex-justify-center flex-row flex-justify-center">
                   <div className="pin-indicator active"></div>
                   <div className="pin-indicator"></div>
                   <div className="pin-indicator"></div>
                   <div className="pin-indicator"></div>
                 </div>

                 <div className="flex-row flex-justify-center margin-small">
                   <div className="number-key">
                     <div className="number-key-content">1</div>
                   </div>
                   <div className="number-key">
                     <div className="number-key-content">
                     2
                       <div className="caption">abc</div>
                     </div>
                   </div>
                   <div className="number-key">
                     <div className="number-key-content">
                     3
                       <div className="caption">def</div>
                     </div>
                   </div>
                 </div>

                 <div className="flex-row flex-justify-center margin-small">
                   <div className="number-key">
                     <div className="number-key-content">
                     4
                       <div className="caption">ghi</div>
                     </div>
                   </div>
                   <div className="number-key">
                     <div className="number-key-content">
                     5
                       <div className="caption">jkl</div>
                     </div>
                   </div>
                   <div className="number-key">
                     <div className="number-key-content">
                     6
                       <div className="caption">mno</div>
                     </div>
                   </div>
                 </div>

                 <div className="flex-row flex-justify-center margin-small">
                   <div className="number-key">
                     <div className="number-key-content">
                     7
                       <div className="caption">pqrs</div>
                     </div>
                   </div>
                   <div className="number-key">
                     <div className="number-key-content">
                     8
                       <div className="caption">tuv</div>
                     </div>
                   </div>
                   <div className="number-key">
                     <div className="number-key-content">
                     9
                       <div className="caption">wxyz</div>
                     </div>
                   </div>
                 </div>

                 <div className="flex-row flex-justify-center margin-small">
                   <div className="pin-pad-key">
                     <div className="number-key-content">Change User</div>
                   </div>
                   <div className="number-key">
                     <div className="number-key-content">0</div>
                   </div>
                   <div className="pin-pad-key">
                     <div className="number-key-content">
                     Touch ID
                     </div>
                   </div>
                 </div>
               </div>);
               }              
    });

}());
