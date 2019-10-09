$(function () {

    var index = parseInt(location.search.match(/\bid=([0-9]*)/)[1], 10);

    $.get('./songs.json').done(function (res) {
        var obj = res[index];
        initPlayer(obj);
    })

    function initPlayer(obj) {
        $('.cover')[0].src = obj['album'];
        $('.page').css('background-image','url(' + obj['background'] + ')');

        var audio = document.createElement('audio');
        audio.src = obj['mp3'];


        audio.oncanplay = function () {
            initText(obj); // 避免文字加载太快很尴尬...
        }

        $('.icon-pause').on('touchstart',function(){
            $('.disc').removeClass('active');
            audio.pause();
        });

        $('.icon-play').on('touchstart',function(){
            $('.disc').addClass('active');
            audio.play();
        });

        setInterval(function () {
            let seconds = audio.currentTime;
            let minutes = ~~(seconds / 60);
            let remain = seconds - (minutes * 60);

            let time = `${pad(minutes)}:${pad(remain)}`; // 数字左边补0
            let $lines = $('.lines>p');
            let $whichLine;
            for(let i = 0; i < $lines.length; i++){
                let currentLineTime = $lines.eq(i).attr('data-time');
                let nextLineTime = $lines.eq(i+1).attr('data-time');
                if($lines.eq(i+1).length !== 0){ // 还有下一行
                    if(currentLineTime < time && nextLineTime > time){
                        $whichLine = $lines.eq(i);
                        break;
                    }
                }
            }

            if($whichLine){
                $whichLine.addClass('active').prev().removeClass('active');
                let top = $whichLine.offset().top;
                let linesTop = $('.lines').offset().top;
                let delta = top - linesTop - $('.lyric').height()/3;
                $('.lines').css('transform',`translateY(-${delta}px`);
            }
        }, 300);

    }

    function initText(obj) {
        $('.song-desc>h3').text(' - ' + obj['author']);
        $('.song-desc>h3').prepend('<span class="name">' + obj['name'] + '</span>');
        parseLyric(obj['lyric']);
    }

    function pad(number) {
        return number >= 10? number + '': '0' + number;
    }

    function parseLyric(lyric) {
        var lines = lyric.split('\n');
        var reg = /^\[(.+)\](.*)$/;
        var arr = lines.map(function (string, index) {
            let matches = string.match(reg);
            if(matches){
                return{'time': matches[1], 'text': matches[2]};
            }
        })
        $lyric = $('.lyric');
        arr.map(function (value) {
            if(value === undefined){
                return;
            }
            $p = $('<p/>');
            $p.attr('data-time', value.time).text(value.text);
            $p.appendTo($lyric.children('.lines'));
        })
    }





})