(function () {
    var showList = document.getElementsByClassName("player-earn-data-show")[0];
    var showerNum = document.getElementsByClassName("player-earn-data-num")[0];
    var ele = document.getElementById('fenye-page');
    var ele1 = document.getElementsByClassName('page')[0];
    var findFenzu = document.getElementsByClassName('find-fenzu')[0];
    var newId = null;
    var clickMonthNum = null;
    var searchChangeNum = 10086;//判断是否先查询主播的初始值
    var searchChangeDay = 10086;//判断是否先选择月份的初始值

    //日 周 月 收益排行切换函数
    var yesterday = new Date();
    var yy = yesterday.getFullYear();
    var mm = yesterday.getMonth() + 1;
    var dd = yesterday.getDate();
    if (dd == 1) {
        console.log('1号')
        $('#month-num').html(mm - 1)
    }else{
        console.log('不是1号')
        $('#month-num').html(mm)
    }
    console.log(dd)
    console.log(mm)
    var nowMonthTxt = $('#month-num').text();
    var nowmonthDate = yy + '-' + nowMonthTxt;
    if (nowMonthTxt > 7) {
        var sixMonthAgo = yy + '-' + (nowMonthTxt - 6) + '-01'
    } else {
        var sixMonthAgo = (yy - 1) + '-' + (6 + parseInt(nowMonthTxt)) + '-01'
    }

    //昨日流水切换函数
    $('.same-xingbi').click(function () {
        commenClickFunction('yesterdayincome')
    })
    //7日流水切换函数
    $('.same-seven').click(function () {
        commenClickFunction('weekincome')
    })
    //月流水切换函数
    $('.month-click').click(function () {
        commenClickFunction('monthincome')
    })
    // $('#month-num').click(function () {
    //     console.log($(this).text())
    // })
    sentAjax(1, null, null, null, 20, 'yesterdayincome');
    function sentAjax(a, b, c, d, e, f) {
        $.ajax({
            type: "post",
            url: "/kugou/public/index.php/home/showerlist/yesterdayIncomeOrderPage",
            data: { page: a, userid: b, nickname: c, groupname: d, pagesize: e, order: f },
            dataType: "json",
            beforeSend: beforeJson,
            complete: completeJson,
            success: function (data) {
                var showerData,
                    count = data.count,
                    starGroup = data.starGroup,
                    data = data.data,
                    num1 = Math.ceil(count / 20);
                shit(data, null, starGroup);
                $("#new-page").pagination({
                    currentPage: 1,
                    totalPage: num1,
                    isShow: true,
                    count: 7,
                    homePageText: "首页",
                    endPageText: "尾页",
                    prevPageText: "上一页",
                    nextPageText: "下一页",
                    callback: function (p) {
                        // $('#loading').removeClass('hide');
                        showList.innerHTML = '';
                        $.when(totalYesterdayAjax(p, null, null, null, 20, 'yesterdayincome')).done(function (data) {
                            showList.innerHTML = '';
                            var newData = data.data;
                            // console.log(data)
                            var starGroup = data.starGroup;
                            shit(newData, p, starGroup)
                        })
                    }
                });
            }
        });
    }
    //分组名称渲染
    // function changeGroupname(group) {
    //     console.log(group)
    //     if (group) {
    //         for (var i = 0; i < group.length; i++) {
    //             group[i].groupname == null ? group[i].groupname = '未分组' : group[i].groupname = group[i].groupname;
    //             // console.info($($('#'+group[i].roomid).find('.renminbi3')[0]).html(group[i].groupname));
    //             $('#' + group[i].roomid).find(('.renminbi3')).html(group[i].groupname);
    //         }

    //     } else {
    //         $('.renminbi3').html('未分组');

    //     }
    // }
    //分组返回数据
    function getFenZu(a, b, c, d, e) {
        $.ajax({
            type: "post",
            url: "/kugou/public/index.php/home/showerlist/yesterdayIncomeOrderPage2",
            data: { page: a, userid: b, nickname: c, groupname: d, pagesize: e, order: 'yesterdayincome' },
            dataType: "json",
            beforeSend: beforeJson,
            complete: completeJson,
            success: function (data) {
                var showerData,
                    count = data.count,
                    data = data.data,
                    num1 = Math.ceil(count / 20);
                shit(data)
                $(".page").simplePaging({
                    allPage: num1,//总页数
                    showPage: 1,//显示页数
                    startPage: 1,//第一页页码数字
                    initPage: 1,//加载完毕自动跳转到第n页
                    showTurnTo: false,//是否显示跳转按钮，false不显示，true显示
                    animateType: "normal",//过渡模式：动画“animation”、跳动“jumpy”、快速移动“fast”、正常速度移动“normal”、缓慢的速度移动“slow”、异常缓慢的速度移动“verySlow”
                    animationTime: 300,//animateType为animation时，动画过渡时间(ms)
                    callBack: function (p) {
                        // $('#loading').removeClass('hide');
                        showList.innerHTML = '';
                        var fenzuPage = totalMonthArr[p - 1];
                        shit(fenzuPage, p)
                    }
                });
            }
        });
    }
    //数据加载前
    function beforeJson() {
        $('#loading').removeClass('hide');
    }
    //数据加载成功
    function completeJson() {
        $('#loading').addClass('hide');
    }
    // 数据渲染函数
    var tBody = document.getElementsByClassName('t-body')[0];
    function shit(arr, p, text) {
        var text = text;
        var p;
        if (p) {
            p = p;
        } else {
            p = 1;
        }
        showList.innerHTML = '';
        if (arr) {
            arr.forEach(function (items, index) {
                var nickName = items.nickname,//主播名字
                    imgPath = items.userlogo,//主播头像
                    joindate = items.joindate,//主播加入时间
                    index1 = (p - 1) * 20 + index + 1,//主播排名
                    pageNum,
                    roomId = items.roomid,//主播房间ID
                    userId = items.userid,//主播ID
                    kugouid = items.kugouid,
                    groupname = items.groupname,
                    groupid = items.groupid,
                    delid = items.clangroupstarid,
                    yesterdayIncome = parseInt(items.yesterdayincome) / 100,//主播昨日星币收入
                    sevenDayIncome = parseInt(items.weekincome) / 100,//主播七日星币收入
                    monthIncome = parseInt(items.monthincome) / 100,//主播月星币收入
                    yesterdayIncomeRMB = parseInt(yesterdayIncome).toFixed() / 1,
                    sevendayIncomeRMB = parseInt(sevenDayIncome).toFixed() / 1,
                    monthIncomeRMB = parseInt(monthIncome).toFixed() / 1;
                if (groupname) {
                    groupname = items.groupname;
                } else {
                    groupname = '未分组';
                }
                var str1 = `<ul class="flex show-list-top${index1}">
                            <li style="width: 10rem; display: flex;">
                                <div style="flex-grow: 1; width: 1rem;" class="circle-left${index1}">
                                    <span style="font-weight: 300; font-size: 1rem;">${index1}</span>
                                </div>
                                <div style="flex-grow:0; padding-top: 0.7rem;">
                                    <img class="circle" style="width: 3rem; height: 3rem;" src="${imgPath}" alt="">
                                </div>
                                <div style="flex-grow: 2; width: 2rem; color: #039be5; position: relative;">
                                    <span style="position: absolute; left: 1rem; font-size: 1rem; min-width: 0rem;">${nickName}</span>
                                </div>
                            </li>
                            <li style="width: 2rem; color: #616161;" class="hide-on-small-only">${addComma(yesterdayIncomeRMB)}元</li>
                            <li style="width: 2rem; color: #616161;" class="hide-on-small-only">${addComma(sevendayIncomeRMB)}元</li>
                            <li style="width: 2rem; color: #616161;">${addComma(monthIncomeRMB)}元</li>
                            <li class="hide-on-small-only" id="groupid${groupid}" style="width: 2rem; color: #616161; position: relative;"><span class="my-group-name">${groupname}</span>
                                    <span class="after" style="position: absolute; right: -1.5rem;"><i class="iconfont icon-zhaojiahao-copy" style="color: #4dd0e1"></i></span>
                                    <div class="son-wrapper">
                                        <div class="group-div" style="left: -12rem;">
                                                <ul class="ul1" showername="${nickName}" delid="${delid}" roomid="${roomId}" style="display: flex; flex-wrap: wrap; margin: 0rem;">
                                                </ul>
                                        </div>
                                    </div>
                            </li>
                            <li style="width: 1rem">
                                <a href="showerMes/roomid/${roomId}" class="">
                                    <span class="" style="display: block; height: 4.2rem; line-height: 4.2rem;">查看数据</span>
                                </a>
                            </li>
                        </ul>`

                showList.innerHTML += str1;
            });
        }
        // <span style="background: #ff4081; padding: 4px 14px; font-weight: 300; font-size: 0.8rem; border-radius: 2px; color: #fff;">查看数据</span>

        // changeGroupname(text)//通过id查询主播所属分组函数
        $('.circle-left1, .circle-left2, .circle-left3').html(' ');
        //未分组点击事件函数
        $('.after').click(function (e) {
            //点击加号动画函数
            var that = $(this);
            // $(this).parent().find('.group-div').toggleClass('group-show')
            $(this).find('i').toggleClass('red-color')
            $("span:has('.red-color')").not(this).find('i').removeClass('red-color').end().parent().find('.son-wrapper').removeClass('group-show')
            if ($(this).parent().find('.son-wrapper').is('.group-show')) {
                $(this).parent().find('.son-wrapper').removeClass('group-show')
            } else {
                setTimeout(function () {
                    that.parent().find('.son-wrapper').addClass('group-show')
                }, 200)
            }
        })
        //点击加号渲染函数
        $.when(sentFenZuAjax()).done(function (data) {
            findFenzu.innerHTML = '';
            $('.find-fenzu').html('');
            var faLen = data.length;
            for (var i = 0; i < faLen; i++) {

                var groupname = data[i].groupname,
                    sonGroup = data[i].children,
                    sonLen = sonGroup.length,
                    groupId = data[i].groupid;
                var strI = document.createElement('i');
                strI.className = 'mdi-hardware-keyboard-arrow-down sw-down fenzu-i';
                var str = document.createElement('li');
                str.innerHTML = groupname;
                str.setAttribute('groupid', groupId)
                str.className = 'fa-li';
                var str2 = document.createElement('ul');
                str2.className = 'son-ul';

                for (var j = 0; j < sonGroup.length; j++) {
                    var sonGroupId = sonGroup[j].groupid,
                        sonGroupName = sonGroup[j].groupname;
                    var str3 = document.createElement('li');
                    str3.setAttribute('groupid', sonGroupId)
                    str3.innerHTML = sonGroupName;

                    str2.appendChild(str3)
                    str.appendChild(str2)
                    str.appendChild(strI);

                }
                $('.group-div').find('.ul1').append(str)

            }
            for (var i = 0; i < faLen; i++) {

                var groupname = data[i].groupname,
                    sonGroup = data[i].children,
                    sonLen = sonGroup.length,
                    groupId = data[i].groupid;
                var strI = document.createElement('i');
                strI.className = 'mdi-hardware-keyboard-arrow-down sw-down fenzu-i';
                var str = document.createElement('li');
                str.innerHTML = groupname;
                str.setAttribute('groupid', groupId)
                str.className = 'fa-li';
                var str2 = document.createElement('ul');
                str2.className = 'son-ul';

                for (var j = 0; j < sonGroup.length; j++) {
                    var sonGroupId = sonGroup[j].groupid,
                        sonGroupName = sonGroup[j].groupname;
                    var str3 = document.createElement('li');
                    str3.setAttribute('groupid', sonGroupId)
                    str3.innerHTML = sonGroupName;

                    str2.appendChild(str3)
                    str.appendChild(str2)
                    str.appendChild(strI);

                }
                $('.find-fenzu').append(str);

            }


        })
        //点击弹出框内的分组名称函数
        $('.group-div').on('click', function (e) {
            var roomid = $(this).find('.ul1').attr('roomid');
            var delid = $(this).find('.ul1').attr('delid');
            var name = $(this).find('.ul1').attr('showername');

            if (e.target.nodeName == 'LI') {
                var newInnerHtml = e.target.innerHTML;
                $('.group-div').removeClass('group-show')
                // $(this).parent().find('.my-group-name').text(newInnerHtml)
                var groupid = e.target.getAttribute('groupid');
                if (parseInt(groupid)) {
                    //弹出框提示区域
                    var that = $(this);
                    layer.confirm('确定添加&nbsp<span style="color: #ff4081;">' + name + '</span>&nbsp到' + ' &nbsp<span style="color: #ff4081;">' + newInnerHtml + '</span>&nbsp组?', {
                        btn: ['确定', '取消'] //按钮
                    }, function () {
                        console.log('是的')
                        $.ajax({
                            type: 'post',
                            url: '/kugou/public/index.php/home/clanmanage/addStarsIntoGroup',
                            data: { roomids: roomid, groupid: groupid },
                            success: function (data) {
                                console.log(data)
                                that.parent().find('.my-group-name').text(newInnerHtml)
                                window.location.reload()
                            }
                        })
                        layer.msg('添加成功', { icon: 1 });
                    }, function () {
                        console.log('考虑考虑')
                        $('.after').find('i').removeClass('red-color')

                        // layer.msg('也可以这样', {
                        //     time: 1000, //20s后自动关闭
                        //     btn: ['明白了', '知道了']
                        // });
                    });
                } else {
                    console.log('未分组')
                    console.log(delid)
                    $.ajax({
                        type: 'post',
                        url: '/kugou/public/index.php/home/clanmanage/delStarFromGroup',
                        data: { id: delid },
                        success: function (data) {
                            console.log(data)
                        }
                    })
                }
            }
        })
    }
    // sentFenZuAjax();
    //动态获取分组名称ajax请求函数
    function sentFenZuAjax() {
        var deffer = $.Deferred();
        $.ajax({
            type: "post",
            url: "/kugou/public/index.php/home/clanmanage/grouptree",
            data: { pagesize: 20 },
            dataType: "json",
            beforeSend: beforeJson,
            complete: completeJson,
            success: function (data) {
                deffer.resolve(data);
            }
        });
        return deffer.promise();
    }
    //分组名称渲染函数
    // function fenZuShow(){
    //     $.when(sentFenZuAjax()).done(function (data) {
    //         data.forEach(function (items) {
    //             var groupName = items.groupname,
    //                 groupId = items.groupid;
    //             var str = '<li groupid="' + groupId + '" class="center-align">\
    //                 <a groupid="'+ groupId + '" class="center-align">' + groupName + '</a>\
    //             </li>'
    //             // findFenzu.innerHTML = '';
    //             findFenzu.innerHTML += str;
    //         })
    //     })

    // }
    //主播按分组点击监听函数
    var findFenzu = document.getElementsByClassName('find-fenzu')[0];
    var findFenzuFa = document.getElementsByClassName('find-fenzu-fa')[0];
    findFenzuFa.addEventListener('click', function (e) {
        var id = e.target.getAttribute('groupid');
        var text = e.target.innerText;
        newId = id;
        if (text == '全部主播') {
            $('.same-liwu span').html('全部主播' + '<i class="mdi-hardware-keyboard-arrow-down sw-down" style="color: rgb(50, 50, 50); vertical-align: -3px; font-size: 14px;"></i>');
            $.ajax({
                type: "post",
                url: "/kugou/public/index.php/home/showerlist/yesterdayIncomeOrderPage",
                data: { page: 1, pagesize: 20, order: 'yesterdayincome' },
                dataType: "json",
                beforeSend: beforeJson,
                complete: completeJson,
                success: function (data) {
                    console.log(data)
                    var showerData,
                        totalIncome = data.totalincome,
                        starGroup = data.starGroup,
                        count = data.count,
                        data = data.data,
                        num1 = Math.ceil(count / 20);
                    if (searchChangeDay == 10086) {
                        console.log('唐老鸭')
                        numScrollFunction(id)
                    } else {
                        var month = clickMonthNum;
                        month = month > 9 ? month : '0' + month;
                        var date = yy + '-' + month + '-01';
                        numScrollFunction(id, date)
                    }
                    shit(data, null, starGroup)
                    $("#new-page").pagination({
                        currentPage: 1,
                        totalPage: num1,
                        isShow: true,
                        count: 7,
                        homePageText: "首页",
                        endPageText: "尾页",
                        prevPageText: "上一页",
                        nextPageText: "下一页",
                        callback: function (p) {
                            // $('#loading').removeClass('hide');
                            showList.innerHTML = '';
                            $.when(totalYesterdayAjax(p, null, null, null, 20, 'yesterdayincome')).done(function (data) {
                                showList.innerHTML = '';
                                var newData = data.data;
                                // console.log(data)
                                var starGroup = data.starGroup;
                                shit(newData, p, starGroup)
                            })
                        }
                    });
                }
            });
        } else {
            $('.same-liwu span').html(text + '<i class="mdi-hardware-keyboard-arrow-down sw-down" style="color: rgb(50, 50, 50); vertical-align: -3px; font-size: 14px;"></i>');
            $.ajax({
                type: "post",
                url: "/kugou/public/index.php/home/showerlist/yesterdayIncomeOrderPage",
                data: { page: 1, pagesize: 20, groupid: id, order: 'yesterdayincome' },
                dataType: "json",
                beforeSend: beforeJson,
                error: function () {
                    showList.innerHTML = '';
                    $('#new-page').html('');
                },
                complete: completeJson,
                success: function (data) {
                    // console.log(data)
                    var showerData,
                        totalIncome = data.totalincome,
                        starGroup = data.starGroup,
                        count = data.count,
                        data = data.data,
                        num1 = Math.ceil(count / 20);
                    if (searchChangeDay == 10086) {
                        numScrollFunction(id)
                    } else {
                        var month = clickMonthNum;
                        month = month > 9 ? month : '0' + month;
                        var date = yy + '-' + month + '-01';
                        numScrollFunction(id, date)
                        console.log(date)
                    }
                    shit(data, null, starGroup)
                    $("#new-page").pagination({
                        currentPage: 1,
                        totalPage: num1,
                        isShow: true,
                        count: 7,
                        homePageText: "首页",
                        endPageText: "尾页",
                        prevPageText: "上一页",
                        nextPageText: "下一页",
                        callback: function (p) {
                            // $('#loading').removeClass('hide');
                            showList.innerHTML = '';
                            $.when(totalYesterdayAjax(p, null, null, id, 20, 'yesterdayincome')).done(function (data) {
                                showList.innerHTML = '';
                                var newData = data.data;
                                // console.log(data)
                                var starGroup = data.starGroup;
                                shit(newData, p, starGroup)
                            })
                        }
                    });
                }
            });
        }
    }, false)
    // ---------------------------搜索功能函数--------------------------------------------------------------------
    // 输入框搜索功能
    var idInput = $('#idinput');
    var button = $('.box-flex-button');
    var valueOld = idInput.val();
    var value;
    idInput.keydown(function (e) {
        if (e.keyCode == '13') {
            if (value) {
                if (searchChangeDay == 10086) {
                    $.when(totalYesterdayAjax(1, value, null, null, 20, 'yesterdayincome')).done(function (data) {
                        searchChangeNum = 10087;
                        laydateRender(data)

                        var starGroup = data.starGroup,
                            data = data.data;
                        showList.innerHTML = '';
                        $('#new-page').html('');
                        shit(data, 1, starGroup)

                    })

                } else {
                    console.log('大水牛')
                    var month = $('#month-num').text();
                    month = month > 9 ? month : '0' + month;
                    var date = yy + '-' + month + '-' + '01';
                    $.when(totalYesterdayAjax(1, value, null, null, 20, 'yesterdayincome', null, date)).done(function (data) {
                        searchChangeNum = 10087;
                        laydateRender(data)

                        var starGroup = data.starGroup,
                            data = data.data;
                        showList.innerHTML = '';
                        $('#new-page').html('');
                        shit(data, 1, starGroup)
                    })
                }
            }
        }
    })
    getValue();
    //获取input输入框实时内容
    function getValue() {
        var timer = null;
        idinput.oninput = function () {
            var _this = this;
            clearTimeout(timer);
            timer = setTimeout(function () {
                value = _this.value;
            })
        }
    }
    button.click(function () {

        if (value) {
            if (searchChangeDay == 10086) {
                $.when(totalYesterdayAjax(1, value, null, null, 20, 'yesterdayincome')).done(function (data) {
                    searchChangeNum = 10087;
                    laydateRender(data)

                    var starGroup = data.starGroup,
                        data = data.data;
                    showList.innerHTML = '';
                    $('#new-page').html('');
                    shit(data, 1, starGroup)

                })

            } else {
                var month = $('#month-num').text();
                month = month > 9 ? month : '0' + month;
                var date = yy + '-' + month + '-' + '01';
                $.when(totalYesterdayAjax(1, value, null, null, 20, 'yesterdayincome', null, date)).done(function (data) {
                    searchChangeNum = 10087;
                    laydateRender(data)

                    var starGroup = data.starGroup,
                        data = data.data;
                    showList.innerHTML = '';
                    $('#new-page').html('');
                    shit(data, 1, starGroup)
                })
            }
        }
    })
    // -------------------数字滚动----------------------------------------------------------------------------------------------------------------------------------------------------------
    //页头滚动数字区域
    const numScrollUrlEarn = '/kugou/public/index.php/home/showerlist/selectStarIncomeTotal';
    //主播汇总数字滚动函数
    numScrollFunction(null, null)
    function numScrollFunction(id, time) {
        $.when(numScroll(numScrollUrlEarn, 1, null, null, id, 20, 'yesterdayincome', time)).done(data => {
            // console.log(data)
            var yesterdayIncome = parseInt(data[0].totalyesterdayincome / 100),
                sevenDayIncome = parseInt(data[0].totalweekincome / 100),
                monthIncome = parseInt(data[0].totalmonthincome / 100);
            // console.log(yesterdayIncome)
            // console.log(sevenDayIncome)
            // console.log(monthIncome)
            var aa = 0,
                bb = 0,
                cc = 0,
                timer;
            timer = setInterval(function () {
                aa += parseInt(yesterdayIncome / 20);
                if (aa > yesterdayIncome) {
                    aa = yesterdayIncome;
                }
                bb += parseInt(sevenDayIncome / 20);
                if (aa == yesterdayIncome) {
                    bb = sevenDayIncome;
                }
                cc += parseInt(monthIncome / 20);
                if (aa == yesterdayIncome) {
                    cc = monthIncome;
                }
                $('.same-yesterday').html(addComma(aa) + '元');
                $('.same-sevenIncom').html(addComma(bb) + '元');
                $('.same-monthIncom').html(addComma(cc) + '元');
                if (aa == yesterdayIncome) {
                    clearInterval(timer)
                    // $('.same-yesterday').html(addComma(aa));
                }
            }, 100)
        })
    }
    //点击切换不同月份的主播收益
    laydateRender()
    function laydateRender(data) {
        laydate.render({
            elem: '#month-num',
            type: 'month',
            // theme: '#0097a7',
            min: sixMonthAgo,
            max: nowmonthDate,
            format: 'M',
            showBottom: false,
            change: function (value) {
                searchChangeDay = 10087;
                if (searchChangeNum == 10086) {//初始值没变,表示没有进行其他操作
                    $('#layui-laydate1').hide();
                    console.log(value)
                    $('#month-num').html(value);
                    clickMonthNum = value;
                    if (value == nowMonthTxt) {
                        commenClickFunction('monthincome');
                        numScrollFunction(newId, null)

                    } else {
                        var value1 = value > 9 ? value : '0' + value;
                        if (value > nowMonthTxt) {
                            var date1 = yy + '-' + value1 + '-01';
                            commenClickFunction('monthincome', date1);
                        } else {
                            var date1 = yy + '-' + value1 + '-01';
                            commenClickFunction('monthincome', date1);
                            numScrollFunction(newId, date1)

                        }
                    }

                } else {

                    var getRoomId = $('#idinput').val();
                    $('#layui-laydate1').hide();
                    $('#month-num').html(value);
                    clickMonthNum = value;
                    if (value == nowMonthTxt) {
                        $.when(totalYesterdayAjax(1, null, null, null, 20, 'monthincome', getRoomId)).done(function (data) {
                            var starGroup = data.starGroup,
                                data = data.data;
                            showList.innerHTML = '';
                            $('#new-page').html('');
                            shit(data, 1, starGroup)
                        })
                    } else {
                        var value1 = value > 9 ? value : '0' + value;
                        if (value > nowMonthTxt) {
                            var date1 = yy + '-' + value1 + '-01';
                            $.when(totalYesterdayAjax(1, null, null, null, 20, 'monthincome', getRoomId, date1)).done(function (data) {
                                console.log(data)
                                var starGroup = data.starGroup,
                                    data = data.data;
                                showList.innerHTML = '';
                                $('#new-page').html('');
                                shit(data, 1, starGroup)

                            })
                        } else {
                            var date1 = yy + '-' + value1 + '-01';
                            $.when(totalYesterdayAjax(1, null, null, null, 20, 'monthincome', getRoomId, date1)).done(function (data) {
                                console.log(data)
                                var starGroup = data.starGroup,
                                    data = data.data;
                                showList.innerHTML = '';
                                $('#new-page').html('');
                                shit(data, 1, starGroup)

                            }).fail(function () {
                                showList.innerHTML = '';
                                $('#loading').addClass('hide');
                                $('body').append('<div class="error-model" style="width: 15rem; height: 9rem; line-height: 9rem; color: #000;text-align: center;position: fixed; top: 50%; left: 50%; font-size: 20px; font-weight:300; border: 2px solid #FCBB18; background: rgba(225,225,225,.75); margin-left: -7.5rem; margin-top: -4.5rem;">' + clickMonthNum + '月没有数据!!</div>')
                                setTimeout(function () {
                                    $('body').find('.error-model').addClass('hide')
                                }, 2000)
                            })
                        }
                    }

                }

            }
        })

    }
    // 三级分组函数
    function groupTree() {
        var defer = $.Deferred();
        $.ajax({
            type: "post",
            url: "/kugou/public/index.php/home/clanmanage/grouptree",
            dataType: "json",
            beforeSend: beforeJson,
            complete: completeJson,
            success: function (data) {
                defer.resolve(data)
            },
            error: function (e) {
                defer.reject(e)
            }
        })
        return defer.promise();
    }
    // $.when(groupTree()).done(data => {
    //     console.log(data)
    // })
    //---------------------------公共函数---------------------------------------------------------------------------------------------
    //日 周 月 收益数据请求函数
    function totalYesterdayAjax(a, b, c, d, e, f, g, h) {
        var defer = $.Deferred();
        $.ajax({
            type: "post",
            url: "/kugou/public/index.php/home/showerlist/yesterdayIncomeOrderPage",
            data: { page: a, userid: b, nickname: c, groupid: d, pagesize: e, order: f, roomid: g, date: h },
            dataType: "json",
            beforeSend: beforeJson,
            complete: completeJson,
            success: function (data) {
                defer.resolve(data)
            },
            error: function (e) {
                defer.reject(e)
            }
        })
        return defer.promise();
    }

    // 按月查询数据渲染函数
    function commenClickFunction(order, time) {
        $.when(totalYesterdayAjax(1, null, null, newId, 20, order, null, time)).done(function (data) {
            var count = data.count,
                starGroup = data.starGroup,
                num1 = Math.ceil(count / 20),
                data = data.data;
            shit(data, null, starGroup)
            $("#new-page").pagination({
                currentPage: 1,
                totalPage: num1,
                isShow: true,
                count: 7,
                homePageText: "首页",
                endPageText: "尾页",
                prevPageText: "上一页",
                nextPageText: "下一页",
                callback: function (p) {
                    showList.innerHTML = '';
                    $.when(totalYesterdayAjax(p, null, null, newId, 20, order, null, time)).done(function (data) {
                        showList.innerHTML = '';
                        var newData = data.data;
                        var starGroup = data.starGroup;
                        shit(newData, p, starGroup)
                    })
                }
            });
        }).fail(function (e) {
            $('#loading').addClass('hide');
            $('#month-num').html(nowMonthTxt)

            $('body').append('<div class="error-model" style="width: 15rem; height: 9rem; line-height: 9rem; color: #000;text-align: center;position: fixed; top: 50%; left: 50%; font-size: 20px; font-weight:300; border: 2px solid #FCBB18; background: rgba(225,225,225,.75); margin-left: -7.5rem; margin-top: -4.5rem;">' + clickMonthNum + '月没有数据!!</div>')
            setTimeout(function () {
                $('body').find('.error-model').addClass('hide')
            }, 2000)
            commenClickFunction(order)
        })
    }
    // 数字滚动数据请求函数
    function numScroll(url, a, b, c, d, e, f, g) {
        var defer = $.Deferred();
        $.ajax({
            type: 'post',
            url,
            data: { page: a, userid: b, nickname: c, groupid: d, pagesize: e, order: f, date: g },
            success: function (data) {
                defer.resolve(data)
            },
            error: function () {
                defer.reject()
            }
        })
        return defer.promise();
    }

    // --------------------------辅助函数----------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    // 拆分数组函数
    function sliceArr(arr, len) {
        var arrLen = arr.length;
        var result = [];
        for (var i = 0; i < arrLen; i += len) {
            result.push(arr.slice(i, i + len))
        }
        return result;
    }
    //数字加点
    function addComma(num) {
        var num = (num || 0).toString();
        var result = '';
        while (num.length > 3) {
            result = ',' + num.slice(-3) + result;
            num = num.slice(0, num.length - 3);
        }
        if (num) { result = num + result; }
        return result;
    }
    //筛选函数
    function filterShower(data, name) {
        var data = data.data;
        var newData;
        newData = data.filter(function (items, index) {
            // console.log(items)
            if (items.groupname == name) {
                return true;
            }
        })
        return newData;
    }
})()
