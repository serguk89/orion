const { fetchInstagramData } = require("./fetchInstagramData.js");
const { fetchTwitterData } = require("./fetchTwitterData.js");

const { shuffleArray } = require("../utils/shuffleArray.js");

const webFeedProcessor = async (value) => {
    return new Promise(async (resolve, reject) => {
        const [instagramUsersObj, instagramPosts, twitterTweets] = await Promise.all([
            processData.processInstagramUsers(value),
            processData.processInstagramPosts(value),
            processData.processTwitterTweets(value)
        ]);

        const processedData = {
            mainData: instagramUsersObj.verified.concat(shuffleArray(instagramPosts.concat(twitterTweets))),
            unverifiedUsers: instagramUsersObj.unverified
        };
    
        //Following piece of code will change over time
        if(processedData.mainData.length < 1) {
            if(processedData.unverifiedUsers.length > 0) {
                processedData.mainData = processedData.unverifiedUsers;
            } else {
                reject("error: no data found");
            }
        }

        resolve(processedData);
    });   
}

const processData = {
    processInstagramUsers: (value) => {
        return new Promise(async (resolve, reject) => {
            let data = await fetchInstagramData.fetchUsers(value);
            resolve(data);
        });
    },
    processInstagramPosts: (value) => {
        return new Promise((resolve, reject) => {
            fetchInstagramData.fetchPosts(value).then(fetchedData => {
                let processedData = [];
                for(let currentChunk of fetchedData) {
                    let resultCardMediaString, mediaTypeStatString;
                    if(currentChunk.data.media.isVideo === true) {
                        resultCardMediaString = `<video class="result-card-media result-card-media-vid" src="${currentChunk.data.media.src}" controls></video>`          
                        mediaTypeStatString = `<p class = "result-card-stat result-card-stat-4col result-card-stat-right"><img class = "result-card-stat-img" src = "images/sm/video.png" type = "image/png"/><br/><span class = "result-card-stat-name">Video</span></p>`;
                    } else {
                        resultCardMediaString = `<img class = "result-card-media result-card-media-img" src = "${currentChunk.data.media.src}"/>`;
                        mediaTypeStatString = `<p class = "result-card-stat result-card-stat-4col result-card-stat-right"><img class = "result-card-stat-img" src = "images/sm/photo.png" type = "image/png"/><br/><span class = "result-card-stat-name">Photo</span></p>`;
                    }

                    processedData.push({
                        type: currentChunk.type,
                        network: currentChunk.network,
                        htmlString: `<div class="result-card result-card-instagram-post">
                            <div class="result-card-main-content">
                                ${resultCardMediaString}
                                <br/>
                                <p class="result-card-text">${currentChunk.data.caption}</p>
                            </div>
                            <div class="result-card-stat-container">
                                <p class = "result-card-stat result-card-stat-4col"><img class = "result-card-stat-img" src = "images/sm/insta.png" type="image/png"/><br/><span class = "result-card-stat-name">Instagram</span></p>
                                <p class="result-card-stat result-card-stat-4col"><span class="result-card-stat-value">${
                                currentChunk.data.likeCount
                                }</span> <br /> <span class="result-card-stat-name">Likes</span></p>
                                    <p class="result-card-stat result-card-stat-4col"><span class="result-card-stat-value">${
                                    currentChunk.data.commentCount
                                    }</span> <br /> <span class="result-card-stat-name">Comments</span></p>
                                ${mediaTypeStatString}
                            </div>
                            <a href = "https://instagram.com/p/${currentChunk.data.shortcode}">
                                <div class="result-card-link">
                                    <img src="/images/sm/link.png" type="image/png" class="result-card-link-img"/>
                                </div>
                            </a>
                            </div>
                        `
                    });
                }
                resolve(processedData);
            });
        })
    },
    processTwitterTweets: (value) => {
        return new Promise(async (resolve, reject) => {
            let data = await fetchTwitterData.fetchTweets(value);
            resolve(data);
        });
    }
}

module.exports = {
    webFeedProcessor
};






//   finalData.push({
//     type: "post",
//     network: "instagram",
//     htmlString: `<div class="result-card result-card-instagram-post">
//       <div class="result-card-main-content">
//         ${resultCardMediaString}
//         <br/>
//         <p class="result-card-text">${caption}</p>
//       </div>
//       <div class="result-card-stat-container">
//         <p class = "result-card-stat result-card-stat-4col"><img class = "result-card-stat-img" src = "images/sm/insta.png" type="image/png"/><br/><span class = "result-card-stat-name">Instagram</span></p>
//         <p class="result-card-stat result-card-stat-4col"><span class="result-card-stat-value">${
//           edge["node"]["edge_liked_by"]["count"]
//         }</span> <br /> <span class="result-card-stat-name">Likes</span></p>
//             <p class="result-card-stat result-card-stat-4col"><span class="result-card-stat-value">${
//               edge["node"]["edge_media_to_comment"]["count"]
//             }</span> <br /> <span class="result-card-stat-name">Comments</span></p>
//         ${mediaTypeStatString}
//       </div>
//       <a href = "https://instagram.com/p/${edge["node"]["shortcode"]}">
//         <div class="result-card-link">
//             <img src="/images/sm/link.png" type="image/png" class="result-card-link-img"/>
//         </div>
//       </a>
//     </div>
//   `
//   });