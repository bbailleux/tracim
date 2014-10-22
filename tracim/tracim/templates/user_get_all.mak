<%inherit file="local:templates.master_authenticated"/>
<%namespace name="TIM" file="tracim.templates.pod"/>
<%namespace name="TOOLBAR" file="tracim.templates.user_toolbars"/>

<%def name="title()">Users</%def>

<div class="container-fluid">
    <div class="row-fluid">
        ${TOOLBAR.USERS(fake_api.current_user)}
        <div>
            <div class="row">
                <div class="col-sm-11">
                    <h1>${TIM.ICO(32, 'apps/system-users')} ${_('Users')}</h1>
                </div>
            </div>
            
            ## ADD A USER
            % if fake_api.current_user.profile.id>=2:
                ## FIXME: check if the current_user is a workspace manager (so he is also allowed to create user)
                ## In this case the user is a pod manager, so he is allowed to create users (and to delete them)
                <div class="row">
                    <!-- #### CREATE A USER #### -->
                    <div class="col-sm-11">
                        <p><a data-toggle="collapse" data-target="#create-user-form"><b>${_('Create a user account...')}</b></a></p>
                        <div id="create-user-form" class="collapse">
                            <div class="pod-inline-form col-sm-6" >
                                <form role="form" method="POST" action="${tg.url('/admin/users')}">
                                    <div class="form-group">
                                        <label for="user-name">${_('Name')}</label>
                                        <input name="name" type="text" class="form-control" id="user-name" placeholder="${_('Name')}">
                                    </div>
                                    <div class="form-group">
                                        <label for="user-email">${_('Email')}</label>
                                        <input name="email" type="text" class="form-control" id="user-email" placeholder="${_('Email address')}">
                                    </div>
                                    <div class="form-group">
                                        <label for="user-password">${_('Password')}</label>
                                        <input name="password" type="password" class="form-control" id="user-password" placeholder="${_('Optionnaly choose a password')}">
                                    </div>
                                    <div class="checkbox">
                                      <label>
                                        <input type="checkbox" class="checkbox" name="is_pod_manager" id="is-pod-manager"> ${_('This user can create workspaces')}
                                      </label>
                                    </div>
                                    <div class="checkbox disabled">
                                      <label>
                                        <input type="checkbox" class="checkbox" disabled name="is_pod_admin" id="is-pod-admin"> ${_('This user is an administrator')}
                                      </label>
                                    </div>
                                        
                                    <span class="pull-right" style="margin-top: 0.5em;">
                                        <button type="submit" class="btn btn-small btn-success" title="Add first comment"><i class=" fa fa-check"></i> ${_('Validate')}</button>
                                    </span>
                                    <script>
                                        $(document).ready(function() {
                                            $('#is-pod-manager').change(function() {
                                                if($('#is-pod-manager').prop('checked')==true) {
                                                    console.log('now manager is checked');
                                                    $('#is-pod-admin').removeAttr('disabled');
                                                    $('#is-pod-admin').parent().parent().removeClass('disabled');
                                                } else {
                                                    console.log('now manager is unchecked');
                                                    $('#is-pod-admin').prop('checked', false);
                                                    $('#is-pod-admin').attr('disabled', 'disabled');
                                                    $('#is-pod-admin').parent().parent().addClass('disabled');
                                                }
                                            });
                                        });
                                    </script>

                                </form>
                                <div style="clear: both;"></div>
                            </div>
                        </div>
                    </div>
                    <!-- #### CREATE A USER [END] #### -->
                </div>
            % endif
            ## ADD A USER [END]


            ## LIST OF USERS
            <div class="row">
                <div  class="col-sm-11">
                    % if result.user_nb<=0:
                        ${TIM.NO_CONTENT_INFO(_('There are no workspace yet. Start by <a class="alert-link" data-toggle="collapse" data-target="#create-workspace-form">creating a workspace</a>.'))}
                    % else:
                        <table class="table table-striped table-hover">
                            <thead>
                                <tr>
                                    <th></th>
                                    <th>${_('User')}</th>
                                    <th>${_('Email')}</th>
                                    <th>${_('Can create workspaces')}</th>
                                    <th>${_('Administrator')}</th>
                                </tr>
                            </thead>
                            % for user in result.users:
                                <tr>
                                    % if user.enabled:
                                        <td title="${_('User enabled. Click to disable this user')}"><a href="${tg.url('/admin/users/{}/disable'.format(user.id))}">${TIM.ICO(16, 'status/item-enabled')}</a></td>
                                        <td><a href="${tg.url('/admin/users/{}'.format(user.id))}"><b>${user.name}</b></a></td>
                                        <td><a href="mailto:${user.email}">${user.email}</a></td>
                                        <td>
                                            <% icon = ('emblems/emblem-unreadable', 'emblems/emblem-checked')[user.profile.id>=2] %>
                                            <% linked_profile = ('pod-manager', 'pod-user')[user.profile.id>=2] %>
                                            <a href="${tg.url('/admin/users/{}/profile/switch?new_role={}'.format(user.id, linked_profile))}">${TIM.ICO(16, icon)}</a>
                                        </td>
                                        <td>
                                            <% icon = ('emblems/emblem-unreadable', 'emblems/emblem-checked')[user.profile.id>=3] %>
                                            <% linked_profile = ('pod-admin', 'pod-manager')[user.profile.id>=3] %>
                                            <a href="${tg.url('/admin/users/{}/profile/switch?new_role={}'.format(user.id, linked_profile))}">${TIM.ICO(16, icon)}</a>
                                        </td>
                                    % else:
                                        <td title="${_('User disabled. Click to enable this user')}"><a href="${tg.url('/admin/users/{}/enable'.format(user.id))}">${TIM.ICO(16, 'status/item-disabled')}</a></td>
                                        <td>${user.name}</td>
                                        <td>${user.email}</td>
                                        <td>
                                            <% icon = ('emblems/emblem-unreadable-disabled', 'emblems/emblem-checked-disabled')[user.profile.id>=2] %>
                                            ${TIM.ICO(16, icon)}
                                        </td>
                                        <td>
                                            <% icon = ('emblems/emblem-unreadable-disabled', 'emblems/emblem-checked-disabled')[user.profile.id>=3] %>
                                            <% linked_profile = ('pod-admin', 'pod-manager')[user.profile.id>=3] %>
                                            ${TIM.ICO(16, icon)}
                                        </td>
                                    % endif
                                </tr>
                            % endfor
                        </table>
                    % endif
                </div>
            </div>
            ## LIST OF USERS [END]


        </div>
    </div>
</div>


