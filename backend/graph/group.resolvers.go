package graph

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.
// Code generated by github.com/99designs/gqlgen version v0.17.36

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/wilbertcoandssss/training-preweb/graph/model"
)

// InsertGroup is the resolver for the insertGroup field.
func (r *mutationResolver) InsertGroup(ctx context.Context, newGroup model.NewGroup) (*model.Group, error) {
	insertedGroup := &model.Group{
		ID:             uuid.NewString(),
		GroupName:      newGroup.GroupName,
		GroupPrivacy:   newGroup.GroupPrivacy,
		GroupDesc:      newGroup.GroupDesc,
		GroupAdmin:     newGroup.GroupAdmin,
		GroupBannerPic: "https://res.cloudinary.com/dw7bewmoo/image/upload/v1692544711/groups-default-cover-photo-2x_l6hhuz.png",
		GroupCreated:   time.Now().Format("2006-01-02 15:04:05"),
	}

	return insertedGroup, r.DB.Save(&insertedGroup).Error
}

// ChangeCoverPhoto is the resolver for the changeCoverPhoto field.
func (r *mutationResolver) ChangeCoverPhoto(ctx context.Context, groupID string, mediaURL string) (bool, error) {
	query := `
	UPDATE groups
	SET group_banner_pic = ?
	WHERE id = ?
	`

	result := r.DB.Exec(query, mediaURL, groupID)

	if result.Error != nil {
		return false, result.Error
	}

	return true, nil
}

// DeleteGroup is the resolver for the deleteGroup field.
func (r *mutationResolver) DeleteGroup(ctx context.Context, groupID string) (bool, error) {
	var group *model.Group

	if err := r.DB.First(&group, "id = ?", groupID).Delete(&group).Error; err != nil {
		return false, err
	}

	// Delete group members from the group_member table
	if err := r.DB.Where("group_id = ?", groupID).Delete(&model.GroupMember{}).Error; err != nil {
		return false, err
	}

	return true, nil
}

// GetAllGroup is the resolver for the getAllGroup field.
func (r *queryResolver) GetAllGroup(ctx context.Context) ([]*model.FetchGroup, error) {
	var groups []*model.Group

	if err := r.DB.Find(&groups).Error; err != nil {
		return nil, err
	}

	var fetchGroups []*model.FetchGroup

	for _, group := range groups {
		fetchGroup := &model.FetchGroup{
			ID:             group.ID,
			GroupName:      group.GroupName,
			GroupPrivacy:   group.GroupPrivacy,
			GroupDesc:      group.GroupDesc,
			GroupAdmin:     group.GroupAdmin,
			GroupBannerPic: group.GroupBannerPic,
			GroupMember:    nil,
			GroupCreated:   group.GroupCreated,
		}

		var groupMemberWUser []*model.GroupMemberWUSer

		var userMember []*model.GroupMember

		if err := r.DB.Where("group_id = ? ", group.ID).Find(&userMember).Error; err != nil {
			return nil, err
		}

		for _, user := range userMember {
			var u *model.User
			if err := r.DB.Where("id = ? ", user.UserID).First(&u).Error; err != nil {
				return nil, err
			}

			groupMemberWUser = append(groupMemberWUser, &model.GroupMemberWUSer{
				UserData:    u,
				GroupMember: user,
			})
		}

		fetchGroup.GroupMember = groupMemberWUser

		fetchGroups = append(fetchGroups, fetchGroup)
	}

	return fetchGroups, nil
}

// GetGroupByID is the resolver for the getGroupById field.
func (r *queryResolver) GetGroupByID(ctx context.Context, userID string) ([]*model.FetchGroup, error) {
	var groups []*model.Group

	if err := r.DB.Find(&groups).Error; err != nil {
		return nil, err
	}

	var fetchGroups []*model.FetchGroup

	for _, group := range groups {
		fetchGroup := &model.FetchGroup{
			ID:             group.ID,
			GroupName:      group.GroupName,
			GroupPrivacy:   group.GroupPrivacy,
			GroupDesc:      group.GroupDesc,
			GroupAdmin:     group.GroupAdmin,
			GroupBannerPic: group.GroupBannerPic,
			GroupMember:    nil,
			GroupCreated:   group.GroupCreated,
		}

		var groupMemberWUser []*model.GroupMemberWUSer

		var userMember []*model.GroupMember

		if err := r.DB.Where("group_id = ? AND user_id = ?", group.ID, userID).Find(&userMember).Error; err != nil {
			return nil, err
		}

		for _, user := range userMember {
			var u *model.User
			if err := r.DB.Where("id = ? ", user.UserID).First(&u).Error; err != nil {
				return nil, err
			}

			groupMemberWUser = append(groupMemberWUser, &model.GroupMemberWUSer{
				UserData:    u,
				GroupMember: user,
			})
		}

		fetchGroup.GroupMember = groupMemberWUser

		fetchGroups = append(fetchGroups, fetchGroup)
	}

	return fetchGroups, nil
}

// GetGroupInfo is the resolver for the getGroupInfo field.
func (r *queryResolver) GetGroupInfo(ctx context.Context, groupID string) (*model.FetchGroup, error) {
	var groups *model.Group

	if err := r.DB.Where("id = ?", groupID).Find(&groups).Error; err != nil {
		return nil, err
	}

	fmt.Println(groups.GroupName, groups.GroupAdmin)

	var fetchGroups *model.FetchGroup

	fetchGroup := &model.FetchGroup{
		ID:             groups.ID,
		GroupName:      groups.GroupName,
		GroupPrivacy:   groups.GroupPrivacy,
		GroupDesc:      groups.GroupDesc,
		GroupAdmin:     groups.GroupAdmin,
		GroupBannerPic: groups.GroupBannerPic,
		GroupMember:    nil,
		GroupCreated:   groups.GroupCreated,
	}

	var groupMemberWUser []*model.GroupMemberWUSer

	var userMember []*model.GroupMember

	if err := r.DB.Where("group_id = ?", groups.ID).Find(&userMember).Error; err != nil {
		return nil, err
	}

	for _, user := range userMember {
		var u *model.User
		if err := r.DB.Where("id = ?", user.UserID).First(&u).Error; err != nil {
			return nil, err
		}

		groupMemberWUser = append(groupMemberWUser, &model.GroupMemberWUSer{
			UserData:    u,
			GroupMember: user,
		})
	}

	fetchGroup.GroupMember = groupMemberWUser

	fetchGroups = fetchGroup

	return fetchGroups, nil
}

// GetAllUserGroupPost is the resolver for the GetAllUserGroupPost field.
func (r *queryResolver) GetAllUserGroupPost(ctx context.Context, limit *int, offset *int, userID string) ([]*model.FetchGroupWPost, error) {
	var groups []*model.Group

	if err := r.DB.Find(&groups).Error; err != nil {
		return nil, err
	}

	var fetchGroups []*model.FetchGroupWPost

	for _, group := range groups {

		fetchGroupWithPost := &model.FetchGroupWPost{
			FetchGroup: nil,
			GroupPost:  nil,
		}

		fetchGroup := &model.FetchGroup{
			ID:             group.ID,
			GroupName:      group.GroupName,
			GroupPrivacy:   group.GroupPrivacy,
			GroupDesc:      group.GroupDesc,
			GroupAdmin:     group.GroupAdmin,
			GroupBannerPic: group.GroupBannerPic,
			GroupMember:    nil,
			GroupCreated:   group.GroupCreated,
		}

		actualOffset := 0
		if offset != nil {
			actualOffset = *offset
		}

		actualLimit := 10 // You can adjust this default value as needed
		if limit != nil {
			actualLimit = *limit
		}

		var groupMemberWUser []*model.GroupMemberWUSer

		var userMember []*model.GroupMember

		if err := r.DB.Where("group_id = ? AND user_id = ?", group.ID, userID).Find(&userMember).Error; err != nil {
			return nil, err
		}

		for _, user := range userMember {
			var u *model.User
			if err := r.DB.Where("id = ? ", user.UserID).First(&u).Error; err != nil {
				return nil, err
			}

			groupMemberWUser = append(groupMemberWUser, &model.GroupMemberWUSer{
				UserData:    u,
				GroupMember: user,
			})
		}

		var groupPostsNew []*model.FetchGroupPost

		groupPosts, err := r.Query().GetAllGroupPost(ctx, &actualLimit, &actualOffset, group.ID)
		if err != nil {
			return nil, err
		}

		for _, post := range groupPosts {
			groupPostsNew = append(groupPostsNew, &model.FetchGroupPost{
				ID:          post.ID,
				ContentText: post.ContentText,
				AuthorID:    post.AuthorID,
				PostDate:    post.PostDate,
				AuthorData:  post.AuthorData,
				LikedCount:  post.LikedCount,
				MediaURL:    post.MediaURL,
				PostPrivacy: post.PostPrivacy,
			})
		}

		fetchGroup.GroupMember = groupMemberWUser

		fetchGroupWithPost.FetchGroup = fetchGroup

		fetchGroupWithPost.GroupPost = groupPostsNew

		fetchGroups = append(fetchGroups, fetchGroupWithPost)
	}

	return fetchGroups, nil
}
