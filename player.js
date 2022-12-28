const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = 'F8_PLAYER';

const playList = $('.playlist');
const heading = $('header h2');
const cdThumb = $('.cd-thumb');
const cd = $('.cd');
const audio = $('#audio');
const btnPlay = $('.btn-toggle-play');
const player = $('.player');
const progress = $('#progress');
const btnNext = $('.btn-next');
const btnPrevious = $('.btn-prev');
const volume = $('#volume');
const btnRand = $('.btn-random');
const btnRepeat = $('.btn-repeat');

const app = {
    currentIndex: 0,
    isPlaying: false,
    isRand: false,
    isRepeat: false,
    volumeValue: 100,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    songs: [
        {
            name: "Họ yêu ai mất rồi",
            singer: "Doãn Hiếu",
            path: "./assets/music/Ho yeu ai mat roi.mp3",
            image: "./assets/img/musical-note.png"
        },
        {
            name: "Illusionary Daytime Remix",
            singer: "Unknown",
            path: "./assets/music/Illusionary Daytime Remix  - DJ TuSo.mp3",
            image: "./assets/img/musical-note.png"
        },
        {
            name: "Love you to death",
            singer: "KCM, Soul Dive",
            path: "./assets/music/Love you to death.mp3",
            image: "./assets/img/musical-note.png"
        },
        {
            name: "Ngày đầu tiên",
            singer: "Đức Phúc",
            path: "./assets/music/ngay dau tien - duc phuc.mp3",
            image: "./assets/img/musical-note.png"
        },
        {
            name: "Save Your Tears Remix",
            singer: "The Weekend & Ariana Grande",
            path: "./assets/music/Save Your Tears Remix_ - The Weeknd_ Ari.mp3",
            image: "./assets/img/musical-note.png"
        },
        {
            name: "Save your tears",
            singer: "The Weekend",
            path: "./assets/music/SaveYourTears-TheWeeknd-6341494.mp3",
            image: "./assets/img/musical-note.png"
        },
        {
            name: "Out of time",
            singer: "The Weekend",
            path: "./assets/music/The Weeknd - Out Of Time (Official Lyric Video).mp3",
            image: "./assets/img/musical-note.png"
        }
    ],
    setconfig: function (key, value) {
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
    },
    getConfig: function () {
        this.isRand = this.config.isRand;
        this.isRepeat = this.config.isRepeat;
        this.volumeValue = Number.parseInt(this.config.volumeValue);
        console.log(this.volumeValue);
    },
    defineProperties: function () {
        Object.defineProperty(this, 'currentSong', {
            get: function () {
                return this.songs[this.currentIndex];
            }
        })
    }
    ,
    handleEvents: function () {
        const _this = this;
        const cdWidth = cd.offsetWidth;

        const cdThumbAnimation = cdThumb.animate([
            { transform: 'rotate(360deg)' }
        ], {
            duration: 10000,
            iterations: Infinity
        });
        cdThumbAnimation.pause();

        document.onscroll = function () {
            const scroll = window.scrollY || document.documentElement.scrollTop;
            const newCdWidth = cdWidth - scroll;
            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0;
            cd.style.opacity = newCdWidth / cdWidth;
        }

        btnPlay.onclick = function () {
            if (app.isPlaying) {
                audio.pause();
            } else {
                audio.play();
            }
        }
        audio.onplay = function () {
            app.isPlaying = true;
            player.classList.add('playing');
            cdThumbAnimation.play();
        }
        audio.onpause = function () {
            app.isPlaying = false;
            player.classList.remove('playing');
            cdThumbAnimation.pause();
        }
        audio.ontimeupdate = function () {
            if (audio.duration) {
                const progressPercent = Math.floor(audio.currentTime / audio.duration * 100);
                progress.value = progressPercent;
            }
        }
        progress.onchange = function (e) {
            const seek = e.target.value / 100 * audio.duration;
            audio.currentTime = seek;
        }

        btnNext.onclick = function () {
            // console.log(this);
            if (_this.isRand) {
                _this.playRandom();
            } else {
                app.nextSong();//this lúc này không trỏ về app nên sai nếu dùng this
            }
            audio.play();
            _this.render();
            _this.scrollToActiveSong();
        };
        btnPrevious.onclick = function () {
            if (_this.isRand) {
                _this.playRandom();
            } else {
                app.previousSong();
            }
            audio.play();
            _this.render();
            _this.scrollToActiveSong();
        };
        volume.onchange = function (e) {
            const value = e.target.value;
            console.log(value);
            audio.volume = value / 100;
            _this.setconfig('volumeValue', value);
        }
        btnRand.onclick = function () {
            _this.isRand = !_this.isRand;
            _this.setconfig('isRand', _this.isRand);
            btnRand.classList.toggle('active', _this.isRand);
        }
        //when audio ended
        audio.onended = function () {
            if (_this.isRepeat) {
                audio.play();
            } else {
                btnNext.click();
            }
        }
        //when button repeat turn on
        btnRepeat.onclick = function (e) {
            _this.isRepeat = !_this.isRepeat;
            _this.setconfig('isRepeat', _this.isRepeat);
            btnRepeat.classList.toggle('active', _this.isRepeat);
        }
        playList.onclick = function (e) {
            let songNotActive = e.target.closest('.song:not(.active)');
            let option = e.target.closest('.option');
            if (songNotActive || option) {
                if (songNotActive) {
                    //dataset.index vẫn đúng với tên data-index, data- ~ dataset
                    _this.currentIndex = Number(songNotActive.getAttribute('data-index'));
                    _this.loadCurrentSong();
                    audio.play();
                    _this.render();
                }
            }
        }
    },
    render: function () {
        const htmls = this.songs.map((song, index) => {
            return `
                <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index="${index}">
                    <div class="thumb" style="background-image: url('${song.image}')">
                    </div>
                    <div class="body">
                        <h3 class="title">${song.name}</h3>
                        <p class="author">${song.singer}</p>
                    </div>
                    <div class="option">
                        <i class="fas fa-ellipsis-h"></i>
                    </div>
                </div>
            `;
        });
        playList.innerHTML = htmls.join('');
    },
    scrollToActiveSong: function () {
        setTimeout(() => {
            $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block: 'nearest'
            });
        }, 300);
    },
    loadCurrentSong: function () {
        heading.textContent = this.currentSong.name;
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
        audio.src = this.currentSong.path;
    },
    nextSong: function () {
        this.currentIndex++;
        if (this.currentIndex >= this.songs.length) {
            this.currentIndex = 0;
        }
        this.loadCurrentSong();
    },
    previousSong: function () {
        this.currentIndex--;
        if (this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1;
        }
        this.loadCurrentSong();
    },
    playRandom: function () {
        let nextRandomIndex;
        do {
            nextRandomIndex = Math.floor(Math.random() * this.songs.length);
        } while (nextRandomIndex === this.currentIndex);
        this.currentIndex = nextRandomIndex;
        this.loadCurrentSong();
    },
    start: function () {
        this.getConfig();
        this.defineProperties();
        this.handleEvents();
        this.loadCurrentSong();
        this.render();
        btnRepeat.classList.toggle('active', this.isRepeat);
        btnRand.classList.toggle('active', this.isRand);
        audio.volume = this.volumeValue / 100;
        volume.value = this.volumeValue;
    }
}
app.start();