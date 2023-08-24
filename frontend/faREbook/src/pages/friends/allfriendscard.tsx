import React from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { ACC_REQ, DECLINE_FRIEND_REQ, GET_ALL_FRIENDS, GET_FRIEND_REQ, MUTUAL_FRIENDS } from '../../queries/userquery';
import styles from "../../styles/style.module.scss";

const AllFriendCard = ({ friend, user }) => {

    const [deleteReq] = useMutation(DECLINE_FRIEND_REQ);
    const [addReq] = useMutation(ACC_REQ);

    const { data: mutualFriendsData, loading: mutualFriendsLoading } = useQuery(MUTUAL_FRIENDS, {
        variables: {
            userId1: user?.validateJWT?.id,
            userId2: friend?.FriendsID,
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

    const confirmReq = async (friendsId: string) => {
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

    if (mutualFriendsLoading) {
        return <p>Loading...</p>;
    }
    else {
        console.log("LAH NI DPT", mutualFriendsData)
    }

    console.log("dapet ga", friend.profilepic)
    return (
        <div key={user.id} className={styles.friendsCard}>
            <img
                src={friend.profilepic} // Replace with the actual image source
                alt={`${user.firstname}'s profile`}
                style={{ width: '100%', height: '185px', borderRadius: '15px 15px 0px 0px' }}
            />
            <div>
                <h2 style={{ margin: '10px 0' }}>{friend.FriendsData.firstname} {friend.FriendsData.surname} </h2>
            </div>
            {mutualFriendsData.getMutualFriends} mutuals
        </div>
    );
};

export default AllFriendCard;
