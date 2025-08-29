from django.contrib import admin
from .models import User, Post, Comment


class UserAdmin(admin.ModelAdmin):
    list_display = ("id", "username", "followers_count", "following_count", "followers_list")
    search_fields = ("username",)
    filter_horizontal = ("following",)

    def followers_list(self, obj):
        # show first few followers, avoid huge lists
        followers = obj.followers.all()[:5]  # limit to 5
        names = ", ".join([u.username for u in followers])
        if obj.followers.count() > 5:
            names += " ..."
        return names or "None"
    followers_list.short_description = "Followers"


class PostAdmin(admin.ModelAdmin):
    list_display = ("id", "author", "content_preview", "like_count", "liked_by", "timestamp")
    search_fields = ("content", "author__username")
    list_filter = ("timestamp",)
    filter_horizontal = ("likes",)

    def content_preview(self, obj):
        return obj.content[:50] + ("..." if len(obj.content) > 50 else "")
    content_preview.short_description = "Content"

    def liked_by(self, obj):
        users = obj.likes.all()[:5]
        names = ", ".join([u.username for u in users])
        if obj.likes.count() > 5:
            names += " ..."
        return names or "None"
    liked_by.short_description = "Liked By"


class CommentAdmin(admin.ModelAdmin):
    list_display = ("id", "author", "post", "short_content", "timestamp")
    search_fields = ("content", "author__username", "post__content")
    list_filter = ("timestamp",)

    def short_content(self, obj):
        return obj.content[:40] + ("..." if len(obj.content) > 40 else "")
    short_content.short_description = "Content"


admin.site.register(User, UserAdmin)
admin.site.register(Post, PostAdmin)
admin.site.register(Comment, CommentAdmin)