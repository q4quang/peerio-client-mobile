Peerio.UI.NotFound = React.createClass({render: function () {return (<div>Route not found</div>);}});

Peerio.UI.Routes = (
    <Route name='root' path='/' handler={Peerio.UI.Root}>
        <DefaultRoute name="index" handler={Peerio.UI.Index}/>
        <NotFoundRoute handler={Peerio.UI.NotFound}/>
        <Route name="connection_lost" path="/connection_lost" handler={Peerio.UI.ConnectionLost}/>
        <Route name="login" path="/login" handler={Peerio.UI.Login}>
            <Route name="login_2fa" path="/login/2fa" handler={Peerio.UI.TwoFactorAuthPrompt} />
        </Route>
        <Route name="signup" path="signup" handler={Peerio.UI.Signup}>
            <Route name="set_passphrase" path="/signup/set_passphrase" handler={Peerio.UI.SetPassphrase} />
        </Route>
        <Route name="two_factor_auth_prompt" path="/2fa" handler={Peerio.UI.TwoFactorAuthPrompt} />
        <Route name="app" path="app" handler={Peerio.UI.App}>

            <Route name='tabs' handler={Peerio.UI.Tabs}>
                <Route name='messages' handler={Peerio.UI.Conversations}/>
                <Route name='files' handler={Peerio.UI.Files}/>
                <Route name='contacts' handler={Peerio.UI.Contacts}/>

            </Route>

            <Route name="conversation" path="/app/conversation/:id" handler={Peerio.UI.Conversation}/>
            <Route name='conversation_info' path="/app/conversation/:id/info" handler={Peerio.UI.ConversationInfo}/>

            <Route name="file" path="/app/file/:id" handler={Peerio.UI.FileView} />
            <Route name="contact" path="/app/contact/:id" handler={Peerio.UI.ContactView} />
            <Route name="new_message" path="/app/new_message/:id?" handler={Peerio.UI.NewMessage} />

            <Route name="upload" path="/app/upload" handler={Peerio.UI.Upload} />
            <Route name="account_settings" path="/app/settings/account" handler={Peerio.UI.AccountSettings}>
                <Route name="enter_confirm" path="/app/settings/account/enter_confirm" handler={Peerio.UI.EnterConfirm} />
                <Route name="account_settings_2fa_prompt" path="/app/settings/account/2fa" handler={Peerio.UI.TwoFactorAuthPrompt} />
            </Route>
            <Route name="preference_settings" path="/app/settings/preferences" handler={Peerio.UI.PreferenceSettings} />
            <Route name="settings_2fa" path="/app/settings/settings_2fa" handler={Peerio.UI.Settings2FA} />

            <Route name='add_contact' path="/app/add_contact" handler={Peerio.UI.AddContact}/>
            <Route name="add_contact_search" path="/app/add_contact_search/:id" handler={Peerio.UI.AddContactSearch}/>
            <Route name="add_contact_import" path="/app/add_contact_import" handler={Peerio.UI.AddContactImport}/>

            <Route name="set_pin" path="/app/set_pin" handler={Peerio.UI.SetPin} />
        </Route>
    </Route>
);

