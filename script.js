// Hamburger Menu Functionality
const hamburger = document.getElementById('hamburger');
const sideMenu = document.getElementById('side-menu');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    sideMenu.classList.toggle('show');
    sideMenu.classList.toggle('hidden');
});

document.addEventListener('click', (e) => {
    // Close menu if clicking outside
    if (!sideMenu.contains(e.target) && !hamburger.contains(e.target)) {
        hamburger.classList.remove('active');
        sideMenu.classList.remove('show');
        sideMenu.classList.add('hidden');
    }
});

// Last.fm Recent Listening Fetch
// --- INSTRUCTIONS ---
// 1. Get your API key from https://www.last.fm/api/account/create
// 2. Replace 'YOUR_LASTFM_API_KEY' and 'YOUR_LASTFM_USERNAME' below
// 3. Optionally, adjust the number of tracks to display

const LASTFM_API_KEY = 'e202c9338b973637d90aabeab40df07f'; // <-- Insert your Last.fm API key here
const LASTFM_USERNAME = 'Victorflxres'; // <-- Insert your Last.fm username here
const TRACK_LIMIT = 10; // Number of recent tracks to display

const lastfmTracksDiv = document.getElementById('lastfm-tracks');
const lastfmInstructions = document.getElementById('lastfm-instructions');

function timeAgo(dateString) {
    if (!dateString) return '';
    const now = Math.floor(Date.now() / 1000);
    const then = parseInt(dateString, 10);
    if (isNaN(then)) return '';
    const diff = now - then;
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff/60)} minute${Math.floor(diff/60)===1?'':'s'} ago`;
    if (diff < 86400) return `${Math.floor(diff/3600)} hour${Math.floor(diff/3600)===1?'':'s'} ago`;
    return `${Math.floor(diff/86400)} day${Math.floor(diff/86400)===1?'':'s'} ago`;
}

async function fetchRecentTracks() {
    // Only show instructions if the placeholders are still present
    if (LASTFM_API_KEY === 'YOUR_LASTFM_API_KEY' || LASTFM_USERNAME === 'YOUR_LASTFM_USERNAME') {
        lastfmInstructions.style.display = 'block';
        lastfmTracksDiv.innerHTML = '';
        return;
    }
    lastfmInstructions.style.display = 'none';
    lastfmTracksDiv.innerHTML = '<p>Loading recent tracks...</p>';
    try {
        const url = `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${encodeURIComponent(LASTFM_USERNAME)}&api_key=${LASTFM_API_KEY}&format=json&limit=${TRACK_LIMIT}`;
        const response = await fetch(url);
        const data = await response.json();
        if (!data.recenttracks || !data.recenttracks.track) {
            lastfmTracksDiv.innerHTML = '<p>No recent tracks found.</p>';
            return;
        }
        const tracks = Array.isArray(data.recenttracks.track) ? data.recenttracks.track : [data.recenttracks.track];
        lastfmTracksDiv.innerHTML = '';
        tracks.forEach(track => {
            const trackName = track.name || 'Unknown Track';
            const artistName = track.artist['#text'] || 'Unknown Artist';
            const albumName = track.album['#text'] || '';
            // Get album art (choose size 'medium' or fallback)
            let albumArt = '';
            if (track.image && track.image.length) {
                const imgObj = track.image.find(img => img.size === 'medium') || track.image[0];
                albumArt = imgObj['#text'] || '';
            }
            if (!albumArt) {
                albumArt = 'https://via.placeholder.com/56x56?text=No+Art';
            }
            // Get time ago info if available
            let timeAgoStr = '';
            if (track.date && track.date.uts) {
                timeAgoStr = timeAgo(track.date.uts);
            } else if (track['@attr'] && track['@attr'].nowplaying) {
                timeAgoStr = 'Now playing';
            }
            // Create track element
            const trackDiv = document.createElement('div');
            trackDiv.className = 'lastfm-track';
            trackDiv.innerHTML = `
                <img src="${albumArt}" alt="Album Art">
                <div class="lastfm-track-info">
                    <div class="lastfm-track-title">${trackName}</div>
                    <div class="lastfm-track-artist">${artistName}</div>
                    <div class="lastfm-track-album">${albumName}</div>
                    <div class="lastfm-track-time">${timeAgoStr}</div>
                </div>
            `;
            lastfmTracksDiv.appendChild(trackDiv);
        });
    } catch (error) {
        lastfmTracksDiv.innerHTML = '<p>Error fetching Last.fm data.</p>';
        console.error('Last.fm API error:', error);
    }
}

// Fetch recent tracks on page load
window.addEventListener('DOMContentLoaded', fetchRecentTracks);
