/* eslint-disable import/no-unresolved */
import SimpleSchema from 'meteor/aldeed:simple-schema';
/* eslint-enable import/no-unresolved */

export default ({ Meteor, Mongo, BaseModel, ServerTime }) => {
    const FriendsCollection = new Mongo.Collection('socialize:friends');

    if (FriendsCollection.configureRedisOplog) {
        FriendsCollection.configureRedisOplog({
            mutation(options, { selector, doc }) {
                const namespaces = [];
                if (doc) {
                    namespaces.push(doc.userId, doc.friendId);
                } else if (selector) {
                    const { _id, userId, friendId } = selector;

                    if (_id) {
                        const friend = FriendsCollection.findOne({ _id: selector._id }, { fields: { userId: 1, friendId: 1 } });
                        if (friend) {
                            namespaces.push(friend.userId, friend.friendId);
                        }
                    } else {
                        userId && namespaces.push(userId);
                        friendId && namespaces.push(friendId);
                    }
                }

                Object.assign(options, {
                    namespaces,
                });
            },
            cursor(options, selector) {
                const newSelector = (selector.$or && selector.$or[0]) || selector;
                const selectorId = newSelector.userId || newSelector.friendId;
                if (selectorId) {
                    Object.assign(options, {
                        namespace: selectorId,
                    });
                }
            },
        });
    }

    class Friend extends BaseModel {
        /**
        * Get the User instance for the friend
        * @function user
        * @memberof Friend
        */
        user() {
            return Meteor.users.findOne({ _id: this.friendId });
        }
    }

    Friend.attachCollection(FriendsCollection);

    // Create the schema for a friend
    FriendsCollection.attachSchema(new SimpleSchema({
        userId: {
            type: String,
            autoValue() {
                if (this.isInsert) {
                    if (!this.isSet || !this.isFromTrustedCode) {
                        return this.userId;
                    }
                }
                return undefined;
            },
            index: 1,
            denyUpdate: true,
        },
        friendId: {
            type: String,
            index: 1,
            denyUpdate: true,
        },
        createdAt: {
            type: Date,
            autoValue() {
                if (this.isInsert) {
                    return ServerTime.date();
                }
                return undefined;
            },
            index: -1,
            denyUpdate: true,
        },
    }));

    return { Friend, FriendsCollection };
};
