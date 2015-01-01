console.log("CONFIG EMAIL");
var nodemailer = require('nodemailer');
var Events = require('../api/services/Events');
var q = require('q');
var moment = require('moment');

module.exports = function setupEmail() {
    // Setup
    var transport = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: 'editsexchange@gmail.com',
            pass: 'a!fO$mnlMAL? :)'
        }
    });

    // Email Generators
    var send = {
        basic: function(to) {
            return {
                from: 'EditsExchange <editsexchange@gmail.com>',
                to: to
            };
        },

        newDraft: function(user, draft) {
            var email = send.basic(user.email);
            email.subject = draft.author + "Posted a New Draft";
            renderEmail("new-draft", {
                toUser: user,
                to: user.email,
                draft: draft
            }).then(function(html) {
                email.html = html;
                transport.sendMail(email, function(err, response) {
                    console.log("NEW DRAFT WAS SENT WITH ERR: ", err, " AND RESP: ", response);
                });
            });
        },

        inviteUser: function(user, draft) {
            var email = send.basic(user.email);
            email.subject = draft.author + "would like you to read his/her draft";
            renderEmail('inviteUser', {
                toUser: user,
                to: user.email,
                draft: draft
            }).then(function(html) {
                email.html = html;
                transport.sendMail(email);
            });
        },

        draftInvite: function(toEmail, draft) {
            var email = send.basic(toEmail);
            email.subject = draft.author + "would like you to read his/her draft";
            renderEmail('draftInvite', {
                toUser: user,
                to: user.email,
                draft: draft
            }).then(function(html) {
                email.html = html;
                transport.sendMail(email);
            });
        },

        groupInviteEmail: function(toEmail, group) {

        },

        newEdit: function(user, edit, draft) {
            User.findOne(edit.editor).then(function(editor) {
                var email = send.basic(user.email);
                email.subject = editor.username + " edited " + draft.title;
                renderEmail("new-edit", {
                    toUser: user,
                    to: user.email,
                    edit: edit,
                    editor: editor,
                    draft: draft
                }).then(function(html) {
                    email.html = html;
                    transport.sendMail(email, function(err, response) {
                        console.log("WAS SENT WITH ERR: ", err, " AND RESP: ", response);
                    });
                });
            });
        },

        newMessage: function(user, newMessage) {
            User.findOne(newMessage.user).then(function(sender) {
                var email = send.basic(user.email);
                email.subject = "New Message From " + user.username;
                console.log("ABOUT TO RENDER FOR EMAIL: ", email);
                renderEmail("new-message", {
                    toUser: user,
                    sender: sender,
                    to: user.email,
                    message: message
                }).then(function(html) {
                    console.log("RENDERED RECIEVED: ", html);
                    email.html = html;
                    transport.sendMail(email, function(err, response) {
                        console.log("WAS SENT WITH ERR: ", err, " AND RESP: ", response);
                    });
                }).fail(function(err) {
                    console.log("RENDER NEW MESSAHE ERR: ", err);
                });
            });
        },

    };

    function renderEmail(emailName, info) {
        var promiser = q.defer();
        sails.hooks.views.render("/email/" + emailName, info, function(err, html) {
            if (err) {
                return promiser.reject(err);
            }
            return promiser.resolve(html);
        });
        return promiser.promise;
    }

    // Email Hooks

    (function emailHooks() {
        Events.about("chats").on("newMessage", function(message, meta) {
            findLastMessageFor(message.chat, 2)
                .then(function(secondToLastMessage) {
                    if ((secondToLastMessage === undefined) || calcTimeDifference(secondToLastMessage.createdAt, message.createdAt) > 3600000) {
                        alertAllChatMembers(message.chat, message);
                    }
                });
        });

        //If th = 1 or undefined, finds last message
        //if th = 2 finds second to last message and so on
        function findLastMessageFor(chatId, th) {
            var promiser = q.defer();
            th = th || 1;
            Message.find({
                chat: chatId
            }).sort({
                createdAt: 'desc'
            }).then(function(messages) {
                if (th > messages.length) {
                    promiser.resolve(undefined);
                }
                promiser.resolve(messages[th - 1]);
            });
            return promiser.promise;
        }

        function calcTimeDifference(time1, time2) {
            var startDate = moment(time1);
            var endDate = moment(time2);
            return endDate.diff(startDate);
        }

        function alertAllChatMembers(chatId, message) {
            Chat.findOne(chatId).populate('users')
                .then(function(chat) {
                    for (var i = 0; i < chat.users.length; i++) {
                        var user = chat.users[i];
                        if (user.id == message.user || user.id == message.user.id) {
                            continue;
                        }
                        send.newMessage(user, message);
                    }
                }, function() {
                    console.log("ALERT CHAT EMAIL ERROR");
                });
        }

        Events.about('drafts').on('create', function(draft) {
            console.log("DRAFT CREATED EVENT");
            User.findOne(draft.author)
                .populate('subscribers')
                .then(function(user) {
                    draft.author = user;
                    alertAllSubscribersOfNewDraft(user, draft);
                }).fail(function(err) {
                    console.log("DRAFT CREATED EMAIL ERROR: ", err);
                });
        });

        function alertAllSubscribersOfNewDraft(user, draft) {
            var subscribers = user.subscribers;
            for (var i = 0; i < subscribers.length; i++) {
                send.newDraft(subscribers[i], draft);
            }
        }

        Events.about('edits').on("create", function(edit) {
            Draft.findOne(edit.draft)
                .populate("author")
                .then(function(draft) {
                    send.newEdit(draft.author, edit, draft);
                });
        });

        //TODO Rethink structure of invites (Maybe invite.user_id not invite.id).
        //Finish sending email and jade
        Events.about('invites').on("createForDraft", function(invite) {
            if (invite.id) {

            } else {
//                send.draftInvite(invite.email, invite.draft); // Was causing unkown problem
            }
        });

        Events.about('invites').on("createForGroup", function(invite) {
            if (invite.id) {

            } else {
 //               send.groupInvite(invite.email, invite.group);
            }
        });

    })();

    // Email Chron Jobs
};