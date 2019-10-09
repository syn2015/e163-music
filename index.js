$(function () {

    var historySearch = ['自己','情','花儿'];
    if(historySearch.length > 0){
        showHistorySearch();
    }
    loadLatestMusic();

    $('.tabs  li').on('click',function (e) {
        $(this).siblings().removeClass('active');
        $(this).addClass('active');
        var index = $(this).index();

        // 切换tab页面
        $('.tabContent>ul').children().eq(index).addClass('active').siblings().removeClass('active');

        if(index === 1){
            loadHotMusic();
        }

    })

    // 获取最新音乐列表
    function loadLatestMusic() {
        var $ul = $(".playList .latestMusic>ul");
        if($ul.attr('dataLoaded') === 'yes'){ return;}

        $.get('./latest_music.json').done(function (result) {
            result.map(function (res) {
                var $li = $('<li>\n' +
                    '<svg class="icon">\n' +
                    ' <use xlink:href="#icon-play"></use>\n' +
                    ' </svg>\n' +
                    ' <h4>歌曲名 1</h4>\n' +
                    ' <p>歌手1 - 专辑1</p>\n' +
                    ' </li>');
                //var $li = $ul.children().eq(index);
                $li.find('h4').text(res['name']);
                var s = res['singer'] + '-' + res['album'];
                $li.find('p').text(s);
                if(res['sq'] === 1){
                    var icon = '<svg class="icon sq_icon"><use xlink:href="#icon-ttpodicon"></use></svg>';
                    $li.find('p').prepend(icon);
                }
                $ul.append($li);
            })

            $('.playList .loading').remove();
            $('.playList .latestMusic').addClass('active');
            $ul.attr('dataLoaded','yes');
        })
    }

    $('.latestMusic>ul').on('click','li',function (e) {
        var index = $(this).index();
        // console.log(index);
        location.href = './song.html?id=' + index;
    })
    // 获取热歌榜
    function loadHotMusic() {
        var $ul = $('.hotList .musicList');
        if($ul.attr('dataLoaded') === 'yes'){ return; }

        $.get('./hot_music.json').done(function (result) {
            result.map(function (value,index) {
                var $li = $ul.children().eq(index);
                $li.find('h4').text(value['name']);
                var s = value['singer'] + '-' + value['album'];
                $li.find('p').text(s);
                if(value['sq'] === 1){
                    var icon = '<svg class="icon sq_icon"><use xlink:href="#icon-ttpodicon"></use></svg>';
                    $li.find('p').prepend(icon);
                }

            })
            $ul.attr('dataLoaded','yes');
            $('.hotList .loading').remove();
            $('.hotList .musicList').addClass('active');

        })
    }

    $('#form').on('submit',function () {
        this.preventDefault();
        console.log('submit event1');
    })

    $('#clearInputIcon').on('click',function () {
        $('#search').val('');
        clearTimeout(timer);
        hideSearchSuggestions();
        showHotSearch();
        showHistorySearch();
    })

    let timer = undefined;
    
    // 监听输入框的回车事件
    $('#search').on('keydown',function (e) {
        if(e.keyCode === 13){
            e.preventDefault();
            var keyword = $(this).val();
            addToHistory(keyword);
            throttle(keyword);
        }
    })
    $('#search').on('input',function () {
         var keyword = $(this).val().trim();
        if(keyword.length > 0){
            document.querySelector('#clearInputIcon').classList.add('show');
            hiddeHotSearch();
            $('.suggestSearch>h3').text('搜索"' + keyword + '"');
            $('.suggestSearch>ul').empty();
            $('.suggestSearch').addClass('show');

            // 函数节流 or 函数防抖 控制
            throttle(keyword);

        }else {
            clearTimeout(timer);
            document.querySelector('#clearInputIcon').classList.remove('show');
            hideSearchSuggestions();
            showHotSearch();
            showHistorySearch();
        }

    })

    function throttle(keyword) {
        if(timer !== undefined){
            clearTimeout(timer);
        }
        // 函数节流 or 函数防抖 控制
        timer = setTimeout(function(){
            searchSongs(keyword).then((res)=>{
                timer = undefined;
                showSearchSuggestions(res);
            });
        },1000);
    }
    
    function showSearchSuggestions(res) {
        $('.suggestSearch>ul').empty();
        if(res.length > 0){
            res.forEach(function (value) {
                var $li = $('<li> <svg class="icon searchIcon">' +
                    '<use xlink:href="#icon-search"></use>' +
                    '</svg>' + '<p>搜索建议1</p>' + '</li>');
                $li.find('p').text(value.name);
                $('.suggestSearch>ul').append($li);
            })
            $('.suggestSearch>ul').addClass('show');
        }



    }

    function hideSearchSuggestions() {
        $('.suggestSearch>ul').empty();
        $('.suggestSearch>h3').text('搜索');
        $('.suggestSearch').removeClass('show');
        $('.suggestSearch>ul').removeClass('show');

    }

    function showHotSearch() {
        $('.hotSearch').removeClass('hide');
    }
    function hiddeHotSearch() {
        $('.hotSearch').addClass('hide');
    }

    function addToHistory(keyword) {
        // 如果原来搜索过该关键字，把它删掉再重新插入到数组最前，保证最新的搜索总是在最前
        var index = historySearch.findIndex(function (item) {
            return item.indexOf(keyword) >= 0;
        })
        if(index !== -1){
            if(index !== 0){
                historySearch.splice(index,1);
                historySearch.splice(0,0,keyword);
            }
        }else{
            // 新的关键字直接插入到数组最前面
            historySearch.splice(0,0,keyword);
        }
        // 限制搜索历史最多只有5个
        if(historySearch.length > 5){
            historySearch = historySearch.splice(0,5);
        }

    }

    function showHistorySearch() {
        $('.history>ul').empty();
        historySearch.forEach(function (value) {
            var $li = $('<li><svg class="icon clock"><use xlink:href="#icon-Clock"></use></svg>' +
                '<p>吴亦凡新专辑</p><svg class="icon delete"><use xlink:href="#icon-delete"></use></svg></li>');
            $li.find('p').text(value);
            $('.history>ul').append($li);
        })
        $('.history').removeClass('hide');
    }


    // 模拟后台请求
    function searchSongs(keyword){
        // es6 的箭头函数
        return new Promise((resolve, reject)=>{
            var database = [
                {
                    'id':1,
                    'name':'那些花儿'
                },
                {
                    'id':2,
                    'name':'情非得已'
                },
                {
                    'id':3,
                    'name':'找自己'
                },
                {
                    'id':4,
                    'name':'black space style'
                },
                {
                    'id':5,
                    'name':'那些花儿2'
                },
                {
                    'id':6,
                    'name':'那些花儿3'
                },


            ];
        let result = database.filter(function (value) {
            return value.name.indexOf(keyword) >= 0;
        });

        setTimeout(function () {
            resolve(result);
        }), (Math.random()*1000 + 1000)}

        );

    }

    $('.history').on('click','svg',function (e) {
        var index = $(e.target).parent().index();
        console.log(index);
        historySearch.splice(index,1);
        $(e.target).parent().remove();
        console.log(historySearch);
    })





})