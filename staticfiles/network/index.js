let current_page = 1;
let current_view = 'all';

document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('#all').addEventListener('click', () => {
        load_posts('all', 1)
    })
    const following = document.querySelector('#following')

    if (following) {
        following.addEventListener('click', () => {
            load_posts('following', 1)
        })
    }

    // Load all posts by default
    load_posts('all')

    const new_post_form = document.querySelector('#new-post-form')
    if (new_post_form) {
        new_post_form.addEventListener('submit', new_post)
    }

    //Event Delegation
    document.addEventListener('click', (event) => {
        //Handle viewing profile by clicking a username
        const username = event.target.closest('.username');
        if (username) {
            event.preventDefault()
            const user_id = username.dataset.userid
            if (user_id) {
                view_profile(user_id)
            }
        }

        //Handle following and unfollowing a profile
        const follow_btn = event.target.closest('.toggle-follow');
        if (follow_btn) {
            event.preventDefault()
            const user_id = follow_btn.dataset.userid
            if (user_id) {
                follow_profile(user_id)
            }
        }

        //Handle liking and unliking a post
        const like_btn = event.target.closest('.like-btn');
        if (like_btn) {
            event.preventDefault()
            const post_id = like_btn.dataset.postid
            if (post_id) {
                like_post(post_id)
            }
        }

        // Handle clicking the edit button link
        const edit_btn = event.target.closest('.edit-btn')
        if (edit_btn) {
            event.preventDefault()
            const post_id = edit_btn.dataset.postid
            if (post_id) {
                render_edit_form(post_id)
            }
        }

        //Handle posting a comment
        const comment_btn = event.target.closest('.comment-btn')
        if (comment_btn) {
            event.preventDefault()
            const post_id = comment_btn.dataset.postid
            if (post_id) {
                comment_post(post_id)
            }
        }

    })


    // Handle navigation from page to page
    document.querySelector('#previous').addEventListener('click', (event) => {
        event.preventDefault()
        load_posts(current_view, current_page - 1)
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    })
    document.querySelector('#next').addEventListener('click', (event) => {
        event.preventDefault()
        load_posts(current_view, current_page + 1)
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    })
})

function load_posts(view, page = current_page) {
    if (view === 'all' || view === 'following') {
        document.querySelector('#profile-container').innerHTML = ''
    }
    fetch(`/posts/${view}/?page=${page}`)
        .then(async response => {
            if (!response.ok) {
                // The request failed; throw the error details
                const errorData = await response.json();
                throw errorData;
            }
            return response.json();
        })
        .then(data => {
            view_posts(data.posts, view)

            data.has_previous ? document.querySelector('#previous').classList.remove('disabled') : document.querySelector('#previous').classList.add('disabled');
            data.has_next ? document.querySelector('#next').classList.remove('disabled') : document.querySelector('#next').classList.add('disabled');
            document.querySelector('#current').textContent = `${data.current_page} of ${data.num_pages}`

            current_page = data.current_page;
            current_view = view

        })
        .catch(error => {
            if (error && error.error) {
                console.log("Error:", error.error);
            } else {
                console.log("Error:", error);
            }
        });
}

function new_post(event) {
    event.preventDefault()

    const content = document.querySelector('#content').value
    //Getting the csrf token too
    const form = document.querySelector('#new-post-form')
    const csrfToken = getCSRFToken()

    fetch('/new', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken
            },
            body: JSON.stringify({
                content
            })
        })
        .then(async response => {
            if (!response.ok) {
                // The request failed; throw the error details
                const errorData = await response.json();
                throw errorData;
            }
            return response.json();
        })
        .then(data => {
            console.log(data.message)
            load_posts('all', 1)
        })
        .catch(error => {
            console.log(error.error)
        })

    document.querySelector('#content').value = ''
}

function view_posts(posts, view) {
    const form = document.querySelector('#form-div')
    if (view === "all") {
        document.querySelector('#heading').innerHTML = 'All Posts'
        if (form) {
            form.style.display = 'block'
        }

    } else if (view === "following") {
        document.querySelector('#heading').innerHTML = 'Following'
        if (form) {
            form.style.display = 'none'
        }
    } else {
        if (form) {
            form.style.display = 'none'
        }
    }

    const container = document.querySelector('#post-container')
    container.innerHTML = ''

    const post_div = document.createElement('div')

    if (posts.length > 0) {
        posts.forEach(post => {
            const div = document.createElement('div')
            div.innerHTML = `
                <div class="card mb-3 shadow-sm w-100">
                    <div class="card-body">
                        <div class="media flex-column flex-md-row">
                            <!-- Avatar -->
                            <div class="mr-md-3 mb-2 mb-md-0 rounded-circle bg-primary text-white d-flex justify-content-center align-items-center"
                                style="width: 40px; height: 40px; font-weight: bold; flex-shrink: 0;">
                                ${post.author.username.charAt(0).toUpperCase()}
                            </div>

                            <!-- Post body -->
                            <div class="media-body">
                                <!-- Username -->
                                <p class="mb-1 username font-weight-bold text-primary" data-userId="${post.author.id}" style="cursor: pointer;">
                                    ${post.author.username}
                                </p>

                                <!-- Edit button -->
                                ${post.can_edit ? `
                                <button type="button" id="edit-post-${post.id}" 
                                    class="edit-btn btn btn-link btn-sm p-0 mb-2 mb-md-0" data-postId="${post.id}">
                                    Edit
                                </button>` : ""}

                                <!-- Post content -->
                                <p id="post-${post.id}" class="content mb-2">${post.content}</p>

                                <!-- Timestamp -->
                                <p class="text-muted mb-1" style="font-size: 0.875rem;">${post.timestamp}</p>

                                <!-- Likes -->
                                <p class="text-muted mb-2 d-flex align-items-center" style="font-size: 0.875rem;">
                                    <i class="${post.is_liked ? 'fas' : 'far'} fa-heart fa-lg text-danger mr-1 like-btn"
                                        data-postId="${post.id}" style="cursor: pointer;"></i>
                                    ${post.likes} Likes
                                </p>

                                <!-- Comments Section -->
                                <div class="mt-3">
                                    <h6 class="text-muted" style="font-size: 0.9rem;">Comments</h6>
                                    
                                    <!-- Existing comments -->
                                    <div id="comments-${post.id}" class="pl-2 border-left" style="max-height: 200px; overflow-y: auto;">
                                        ${post.comments.length > 0 ? post.comments.map(comment => `
                                            <div class="mb-2">
                                                <span class="font-weight-bold text-primary username" data-userId="${comment.author.id}" style="font-size: 0.85rem; cursor: pointer;">
                                                    ${comment.author.username}
                                                </span>
                                                <p class="mb-0" style="font-size: 0.85rem;">${comment.content}</p>
                                                <small class="text-muted" style="font-size: 0.75rem;">${comment.timestamp}</small>
                                            </div>
                                        `).join('') : `
                                            <p class="text-muted mb-0" style="font-size: 0.85rem;">No comments yet</p>`}
                                    </div>

                                    <!-- Comment form -->
                                    ${post.is_authenticated ? `
                                    <form class="mt-2 d-flex flex-column flex-sm-row align-items-stretch">
                                        <input type="text" name="comment" id="comment-${post.id}" 
                                            class="form-control form-control-sm mb-2 mb-sm-0 mr-sm-2 flex-grow-1" 
                                            placeholder="Write a comment..." required>
                                        <button type="submit" class="btn btn-primary btn-sm comment-btn" data-postId="${post.id}">
                                            Post
                                        </button>
                                    </form>
                                    ` : ""}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `
            post_div.append(div)
        })

        //Show the nav when there is something to show
        document.querySelector('#page_nav').style.display = 'block'
    } else {
        post_div.className = 'alert alert-info text-center mx-4'
        post_div.setAttribute('role', 'alert')
        post_div.innerHTML = 'No posts to see here🔎'

        // Hide the page nav if there is nothing to show
        document.querySelector('#page_nav').style.display = 'none'
    }

    container.append(post_div)

}

function view_profile(user_id) {
    fetch(`/profile/${user_id}`)
        .then(async response => {
            if (!response.ok) {
                // The request failed; throw the error details
                const errorData = await response.json();
                throw errorData;
            }
            return response.json();
        })
        .then(profile => {
            const profileDiv = document.querySelector('#profile-container')
            profileDiv.innerHTML = `
            <div class="card w-100 border-0 shadow-sm mb-4">
                <div class="card-body text-center">

                    <!-- Followers & Following -->
                    <div class="d-flex flex-column flex-sm-row justify-content-center mb-3">
                        <p class="mb-1 mx-2 text-secondary">
                            <strong>Followers:</strong> ${profile.followers}
                        </p>
                        <p class="mb-1 mx-2 text-secondary">
                            <strong>Following:</strong> ${profile.following}
                        </p>
                    </div>

                    <!-- Follow/Unfollow Button -->
                    ${profile.is_following !== null
                        ? profile.is_following
                            ? `<button class="toggle-follow btn btn-outline-danger mb-3" data-userId="${profile.id}">Unfollow</button>`
                            : `<button class="toggle-follow btn btn-outline-primary mb-3" data-userId="${profile.id}">Follow</button>`
                        : ""
                    }

                    <hr>

                    <!-- Section heading -->
                    <h6 class="text-muted text-uppercase font-weight-bold">All Posts</h6>
                </div>
            </div>
        `
            document.querySelector('#heading').innerHTML = profile.username
            load_posts(profile.id.toString(), 1)
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        })
        .catch(error => console.log("Error:", error.error))
}

function follow_profile(user_id) {
    //handle the logic of following a user
    fetch(`/profile/${user_id}`, {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCSRFToken()
            }
        })
        .then(async response => {
            if (!response.ok) {
                const errorData = await response.json();
                throw errorData;
            }
            return response.json();
        })
        .then(data => {
            console.log(data.message);
            view_profile(user_id)
        })
        .catch(error => console.error('Error:', error.error));
}

function like_post(post_id) {
    //handle the logic of following a user
    fetch(`/like/${post_id}`, {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCSRFToken()
            }
        })
        .then(async response => {
            if (!response.ok) {
                const errorData = await response.json();
                throw errorData;
            }
            return response.json();
        })
        .then(data => {
            console.log(data.message);
            load_posts(current_view)
        })
        .catch(error => console.error('Error:', error.error));
}

function render_edit_form(post_id) {
    post = document.querySelector(`#post-${post_id}`)

    //Make the edit button disappear
    document.querySelector(`#edit-post-${post_id}`).style.display = 'none'


    content = post.textContent;

    const form = document.createElement('form');
    form.className = 'mb-3'

    const textarea = document.createElement('textarea');
    textarea.className = 'form-control mb-2';
    textarea.rows = 3;
    textarea.placeholder = "Edit your content...";

    const submit = document.createElement('button');
    submit.className = 'btn btn-primary btn-sm';
    submit.type = 'submit';
    submit.textContent = 'Edit';

    textarea.value = content;

    form.appendChild(textarea);
    form.appendChild(submit);


    post.replaceWith(form)

    form.addEventListener('submit', (event) => {
        event.preventDefault()
        edit_post(post_id, textarea.value)
    })

}

function edit_post(post_id, new_content) {
    const csrfToken = getCSRFToken()

    fetch(`/edit/${post_id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken
            },
            body: JSON.stringify({
                content: new_content
            })
        })
        .then(async response => {
            if (!response.ok) {
                // The request failed; throw the error details
                const errorData = await response.json();
                throw errorData;
            }
            return response.json();
        })
        .then(data => {
            console.log(data.message)

            //Make the edit button reappear
            document.querySelector(`#edit-post-${post_id}`).style.display = 'block'
            load_posts(current_view)
        })
        .catch(error => {
            console.log(error.error)
            //Make the edit button reappear
            document.querySelector(`#edit-post-${post_id}`).style.display = 'block'
            load_posts(current_view)
        })
}

function comment_post(post_id) {
    const csrfToken = getCSRFToken()

    new_content = document.querySelector(`#comment-${post_id}`).value

    fetch(`/comment/${post_id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken
            },
            body: JSON.stringify({
                content: new_content
            })
        })
        .then(async response => {
            if (!response.ok) {
                // The request failed; throw the error details
                const errorData = await response.json();
                throw errorData;
            }
            return response.json();
        })
        .then(data => {
            console.log(data.message)

            load_posts(current_view)
        })
        .catch(error => {
            console.log(error.error)
            load_posts(current_view)
        })
}

function getCSRFToken() {
    return document.cookie
        .split('; ')
        .find(row => row.startsWith('csrftoken='))
        ?.split('=')[1];
}
