import {getAccessToken} from './utilities.js';
const rootURL = 'https://photo-app-secured.herokuapp.com';
let token;

const showStories = async (token) => {
    const endpoint = `${rootURL}/api/stories`;
    const response = await fetch(endpoint, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        }
    })
    const data = await response.json();
    console.log('Stories:', data);
    const htmlChunk = renderStoriesHeader(data);
    document.querySelector('.stories').innerHTML = htmlChunk;
}

const showPosts = async (token) => {
    const endpoint = `${rootURL}/api/posts`;
    const response = await fetch(endpoint, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        }
    })
    const data = await response.json();
    console.log('Posts:', data);
    const arrayOfHTML = data.map(renderCard);
    const htmlChunk = arrayOfHTML.join('');
    document.querySelector('.card-container').innerHTML = htmlChunk;
}

const showUser = async (token) => {
    const endpoint = `${rootURL}/api/profile`;
    const response = await fetch(endpoint, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        }
    })
    const data = await response.json();
    console.log('Posts:', data);
    const htmlChunk = renderHeader(data);
    document.querySelector('.header').innerHTML = htmlChunk;
}

const showSuggestions = async (token) => {
    const endpoint = `${rootURL}/api/suggestions/`;
    const response = await fetch(endpoint, {
        method: "GET",
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        }
    })
    const data = await response.json();
    console.log('suggestion:', data);
    const arrayOfHTML = data.map(renderSuggestions);
    const htmlChunk = arrayOfHTML.join('');
    document.querySelector('.suggestions-section').innerHTML = htmlChunk;
}


/* SUGGESTIONS */

const renderSuggestions = (data) => {
    const suggestionsContainer = `
            <section id="following_${data.id}">
                <img src=${data.thumb_url} class="pic" />
                <div>
                    <p class="username">${data.username}</p>
                    <p>suggested for you</p>
                </div>
                <button class="button" id="follow-button-${data.id}" onclick="followPost(${data.id})" aria-label="follow" aria-checked="true">follow</button>
            </section>
    `;
    return suggestionsContainer;
};


const renderFollower = (data) => {
    console.log("data",data);
    const suggestionsContainer = `
            <section id="following_${data.following.id}">
                <img src=${data.following.thumb_url} class="pic" />
                <div>
                    <p class="username">${data.following.username}</p>
                    <p>suggested for you</p>
                </div>
                <button class="button" id="follow-button-${data.following.id}" onclick="unFollowPost(${data.id}, ${data.following.id})">unfollow</button>
            </section>
    `;
    return suggestionsContainer;
};

const renderHeader = (data) => {
    const header = `
        <img src=${data.thumb_url} class="pic" />
        <h2>${data.username}</h2>
    `;
    return header;
};



const renderCard = (data) => {
    
    const cardContainerHTML = `
            <section class="card" id="post_${data.id}">
                <div class="header">
                    <h3>${data.user.username}</h3>
                    <button class="icon-button"><i class="fas fa-ellipsis-h"></i></button>
                </div>
                <img src=${data.image_url} alt="placeholder image" width="300" height="300">
                <div class="info">
                    <div class="buttons">
                        <div>
                            ${getLikeButton(data)}
                            <button class="icon-button"><i class="far fa-comment"></i></button>
                            <button class="icon-button"><i class="far fa-paper-plane"></i></button>
                        </div>
                        <div>
                            ${getBookmarkButton(data)}
                        </div>
                    </div>
                    <p class="likes"><strong>${data.likes.length} likes </strong></p>
                    <div class="caption">
                        <p>
                            <strong>${data.user.username}</strong> 
                            ${data.caption}
                        </p>
                        
                    </div>
                    <div class="comments">
                        ${
                            data.comments.length > 1 ?
                            `
                            <button class="view-comments" onclick="openModal(${data.id});">View all ${data.comments.length} comments</button>
                            <p>
                                <strong>${data.comments[data.comments.length - 1].user.username}</strong> 
                                ${data.comments[data.comments.length - 1].text}
                            </p>
                            ` :
                            data.comments.length === 1 ?
                            `
                            <p>
                                <strong>${data.comments[0].user.username}</strong> 
                                ${data.comments[0].text}
                            </p>
                            ` :
                            ''
                            
                        }
                        <p class="timestamp">${data.display_time}</p>
                    </div>
                </div>
                ${getPostButton(data)}
            </section>
            
            <div class="modal-bg hidden" aria-hidden="true" role="dialog" id= "modal-${data.id}">
                <section class="modal">
                <button class="close" id = "close" aria-label="Close the modal window" onclick="closeModal(${data.id});"><i class="fa-solid fa-xmark" style="color: white; font-size: 4em;"></i></button>
                    <div class="modal-body">
                        <!-- Uses a background image -->
                        <img src=${data.image_url} alt="placeholder image" width="600" height="430">
                        <section class="the-comments">
                        <p id="modal-username">
                            <img src="${data.user.image_url}" alt="User Image">
                            <strong id= "modal-name">${data.user.username}</strong>
                        </p>
                        ${renderComments(data.comments)}
                      </section>
                        </div>
                </section>
            </div>
    `;
    return cardContainerHTML;
};  

const renderComments = (comments) => {
    return comments.map(comment => {
        return `
            <p>
                <strong>${comment.user.username}</strong> 
                ${comment.text}<br><br>
                ${comment.display_time}
            </p>
        `;
    }).join('');
};

const getPostButton = data=>{
    return `
    <div class="add-comment">
        <div class="input-holder">
            <i class="far fa-smile"></i>
            <input id="text-box-${data.id}" type="text" placeholder="Add a comment...">
        </div>
        <button class="button" onclick="addText(${data.id}, document.getElementById('text-box-${data.id}').value)">Post</button>
    </div>
    `;
}

window.openModal = ev => {
    const modalElement = document.querySelector('#modal-' + ev);
    modalElement.classList.remove('hidden');
    modalElement.setAttribute('aria-hidden', 'false');
    document.querySelector('#close').focus();
}

window.closeModal = ev => {
    const modalElement = document.querySelector('#modal-' + ev);
    console.log('close!');
    modalElement.classList.add('hidden');
    modalElement.setAttribute('aria-hidden', 'true');
    const openElement = document.querySelector('.open');
}; 

/* STORIES */
const targetElementAndReplace = (selector, newHTML) => { 
	const div = document.createElement('div'); 
	div.innerHTML = newHTML;
	const newEl = div.firstElementChild; 
    const oldEl = document.querySelector(selector);
    oldEl.parentElement.replaceChild(newEl, oldEl);
}

const renderStoriesHeader = (data) => {
    const storiesHtml = data.slice(0, 4).map((item) => `
      <div>
        <img src="${item.user.thumb_url}" class="pic" />
        <p>${item.user.username}</p>
      </div>
    `).join('');
    return storiesHtml;
  };


window.bookmarkPost = async (postId) => {
    // define the endpoint:
    const endpoint = `${rootURL}/api/bookmarks/`;
    const postData = {
        "post_id": postId // replace with the actual post ID
    };

    // Create the bookmark:
    const response = await fetch(endpoint, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify(postData)
    })
    const data = await response.json();
    console.log(data);
    requeryRedraw(postId);
}

window.unBookmarkPost = async (bookmarkId, postId) => {
    // define the endpoint:
    const endpoint = `${rootURL}/api/bookmarks/${bookmarkId}`;

    // Create the bookmark:
    const response = await fetch(endpoint, {
        method: "DELETE",
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        }
    })
    const data = await response.json();
    console.log(data);
    requeryRedraw(postId);
}

const getBookmarkButton = post => {
    if(post.current_user_bookmark_id) {
        return `
            <button class="icon-button" onclick="unBookmarkPost(${post.current_user_bookmark_id}, ${post.id})" aria-label="Unbookmark" aria-checked="true">
                <i class="fa-solid fa-bookmark"></i>
            </button>
        `;
    } else {
        return `
            <button class="icon-button" onclick="bookmarkPost(${post.id})" aria-label="Bookmark" aria-checked="false">
                <i class="fa-regular fa-bookmark"></i>
            </button>
        `;
    }
};

const requeryRedraw = async(postId) => {
    const endpoint = `${rootURL}/api/posts/${postId}`;
    console.log(postId);
    console.log(endpoint);
    const response = await fetch(endpoint, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        }
    })
    const post = await response.json();
    console.log(post);
    const htmlString = renderCard(post);
    //console.log("this",htmlString);
    targetElementAndReplace(`#post_${post.id}`, htmlString)
}

const getLikeButton = post => {
    if(post.current_user_like_id) {
        return `
            <button class="icon-button" onclick="unLikePost(${post.current_user_like_id}, ${post.id})" aria-label="Unlike" aria-checked="true">
                <i class="fa-solid fa-heart"></i>
            </button>
        `;
    } else {
        return `
            <button class="icon-button" onclick="likePost(${post.id})" aria-label="Like" aria-checked="false">
                <i class="fa-regular fa-heart"></i>
            </button>
        `;
    }
};

window.likePost = async (postId) => {
    // define the endpoint:
    const endpoint = `${rootURL}/api/posts/likes/`;
    const postData = {
        "post_id": postId // replace with the actual post ID
    };

    // Create the bookmark:
    const response = await fetch(endpoint, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify(postData)
    })
    const data = await response.json();
    console.log(data);
    requeryRedraw(postId);
}

window.unLikePost = async (likeId, postId) => {
    // define the endpoint:
    const endpoint = `${rootURL}/api/posts/likes/${likeId}`;

    // Create the bookmark:
    const response = await fetch(endpoint, {
        method: "DELETE",
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        }
    })
    const data = await response.json();
    console.log(data);
    requeryRedraw(postId);
}

const followRequeryRedraw = (post, data) => {

    const htmlString = renderFollower(post);
    console.log("this",htmlString);
    targetElementAndReplace(`#following_${data}`, htmlString)
}

window.unFollowPost = async (postId, post) => {
    // define the endpoint:
    const endpoint = `${rootURL}/api/following/${postId}`;

    // Create the bookmark:
    const response = await fetch(endpoint, {
        method: "DELETE",
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        }
    })
    const data = await response.json();
    console.log(data);
    targetElementAndReplace(`#follow-button-${post}`, `<button class="button" id="follow-button-${post}" onclick="followPost(${post})" aria-label="unfollow" aria-checked="false">follow</button>`);
}

window.followPost = async (postId) => {
    // define the endpoint:
    const endpoint = `${rootURL}/api/following`;
    const postData = {
        "user_id": postId // replace with the actual post ID
    };

    // Create the bookmark:
    const response = await fetch(endpoint, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify(postData)
    })

    const data = await response.json();
    console.log("posted!", data);
    followRequeryRedraw(data, postId);
}

window.addText = async (postId, text) => {
    // define the endpoint:
    const endpoint = `${rootURL}/api/comments`;
    console.log("this is ", text);
    const postData = {
        "post_id": postId,
        "text": text
    };

    // Create the bookmark:
    const response = await fetch(endpoint, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify(postData)
    })

    const data = await response.json();
    console.log("test", data);
    requeryRedraw(postId);
}

const initPage = async () => {
    // first log in (we will build on this after Spring Break):
    token = await getAccessToken(rootURL, 'matt', 'matt_password');

    // then use the access token provided to access data on the user's behalf
    showStories(token);
    showPosts(token);
    showUser(token);
    showSuggestions(token);
    //showFollowers(token);
}

initPage();