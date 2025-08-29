from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),

    # API routes
    path("new", views.new_post, name="new"),
    path("posts/<str:view>/", views.get_posts, name="posts"),
    path("profile/<int:user_id>", views.view_profile, name="profile"),
    path("like/<int:post_id>", views.like_post, name="like"),
    path("edit/<int:post_id>", views.edit_post, name="edit"),
    path("comment/<int:post_id>", views.comment, name="comment")
]
