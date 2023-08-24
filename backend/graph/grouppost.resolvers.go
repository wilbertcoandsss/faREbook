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

// InsertGroupPost is the resolver for the insertGroupPost field.
func (r *mutationResolver) InsertGroupPost(ctx context.Context, inputGroupPost model.NewGroupPostInput) (*model.GroupPost, error) {
	newGroupPost := &model.GroupPost{
		ID:          uuid.NewString(),
		GroupID:     inputGroupPost.GroupID,
		ContentText: inputGroupPost.ContentText,
		AuthorID:    inputGroupPost.AuthorID,
		PostDate:    time.Now().Format("2006-01-02 15:04:05"),
		PostPrivacy: inputGroupPost.PostPrivacy,
	}

	return newGroupPost, r.DB.Save(&newGroupPost).Error
}

// GetAllGroupPost is the resolver for the getAllGroupPost field.
func (r *queryResolver) GetAllGroupPost(ctx context.Context, limit *int, offset *int, groupID string) ([]*model.FetchGroupPost, error) {
	var posts []*model.GroupPost

	actualOffset := 0
	if offset != nil {
		actualOffset = *offset
	}

	actualLimit := 10 // You can adjust this default value as needed
	if limit != nil {
		actualLimit = *limit
	}

	if err := r.DB.Limit(actualLimit).Offset(actualOffset).Where("group_id = ?", groupID).Find(&posts).Error; err != nil {
		return nil, err
	}

	var fetchPosts []*model.FetchGroupPost

	// Iterate through each Post and create a corresponding FetchPost
	for _, post := range posts {
		fetchPost := &model.FetchGroupPost{
			ID:          post.ID,
			ContentText: post.ContentText,
			AuthorID:    post.AuthorID,
			PostDate:    post.PostDate,
			AuthorData:  nil, // Initialize AuthorData as nil
			LikedCount:  0,   // Initialize LikeCount
			MediaURL:    nil,
			PostPrivacy: post.PostPrivacy,
		}
		// Retrieve user data based on AuthorID from the database
		var user model.User

		if err := r.DB.Where("id = ?", post.AuthorID).First(&user).Error; err != nil {
			return nil, err
		}

		fetchPost.AuthorData = &user // Set AuthorData with user data

		// Count likes for the current post
		var likeCount int64
		if err := r.DB.Model(&model.Like{}).Where("post_id = ?", post.ID).Count(&likeCount).Error; err != nil {
			return nil, err
		}

		fetchPost.LikedCount = int(likeCount)

		// Media
		var mediaURLs []string
		var mediaList []*model.Media
		if err := r.DB.Where("post_id = ?", post.ID).Find(&mediaList).Error; err != nil {
			return nil, err
		}
		for _, media := range mediaList {
			mediaURLs = append(mediaURLs, media.MediaURL)
		}
		fetchPost.MediaURL = mediaURLs

		fetchPosts = append(fetchPosts, fetchPost)
	}

	return fetchPosts, nil
}

// GetAllGroupPostWithoutLimit is the resolver for the getAllGroupPostWithoutLimit field.
func (r *queryResolver) GetAllGroupPostWithoutLimit(ctx context.Context, limit *int, offset *int) ([]*model.FetchGroupPost, error) {
	panic(fmt.Errorf("not implemented: GetAllGroupPostWithoutLimit - getAllGroupPostWithoutLimit"))
}