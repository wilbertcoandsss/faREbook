import React, { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { ACC_REQ, DECLINE_FRIEND_REQ, GET_ALL_FRIENDS, GET_FRIEND_REQ, MUTUAL_FRIENDS, REQ_FRIENDS } from '../../queries/userquery';
import styles from "../../styles/style.module.scss";

const FriendCard = ({ friend, user, refetch}) => {

    const [deleteReq] = useMutation(DECLINE_FRIEND_REQ);
    const [addReq] = useMutation(ACC_REQ);
    const [reqFriends] = useMutation(REQ_FRIENDS);

    const { data: mutualFriendsData, loading: mutualFriendsLoading } = useQuery(MUTUAL_FRIENDS, {
        variables: {
            userId1: user?.validateJWT?.id,
            userId2: friend?.id,
        },
    });

    const { data: friendsData, loading: friendsLoading, refetch: friendsRefetch } = useQuery(GET_ALL_FRIENDS, {
        variables: {
            userId: user?.validateJWT?.id
        }
    });

    const { data: friendsReqData, loading: friendsReqLoading, refetch: friendsReqRefetch } = useQuery(GET_FRIEND_REQ, {
        variables: {
            userId: user?.validateJWT?.id
        }
    });

    const requestFriends = async (friendsId: string) => {
        await reqFriends({
            variables: {
                userId: friendsId,
                friendsId: user?.validateJWT?.id
            }
        }).then(() => {
            friendsRefetch();
            friendsReqRefetch();
            refetch();
        })
    }

    const confirmReq = async (friendsId: string) => {
        console.log(friendsId);
        await addReq({
            variables: {
                userId: user?.validateJWT?.id,
                friendsId: friendsId

            }
        }).then(() => {
            friendsRefetch();
            friendsReqRefetch();
        })
    }

    const declineReq = async (friendsId: string) => {
        await deleteReq({
            variables: {
                userId: user?.validateJWT?.id,
                friendsId: friendsId
            }
        }).then(() => {
            friendsRefetch();
            friendsReqRefetch();
        })
    }

    console.log(friend.profilepic)

    return (
        <div key={user.id} className={styles.friendsCard} style={{ width: '200px' }}>
            <img
                src={friend.profilepic} // Replace with the actual image source
                alt={`${user.firstname}'s profile`}
                style={{ width: '100%', height: '185px', borderRadius: '15px 15px 0px 0px' }}
            />
            <div>
                <h2 style={{ margin: '10px 0' }}>{friend.firstname} {friend.surname} </h2>
            </div>
            <h4>{mutualFriendsData?.getMutualFriends} mutuals</h4>
            <div className={styles.confirmFriendsBtn} onClick={() => requestFriends(friend.id)}>
                Add
            </div>
            <div className={styles.deleteFriendsBtn} onClick={() => declineReq(friend.id)}>
                Remove
            </div>
        </div>
    );
};

export default FriendCard;
