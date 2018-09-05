(function () {
    //日 周 月 收益排行切换函数
    var yesterday = new Date();
    var yy = yesterday.getFullYear();
    var mm = yesterday.getMonth() + 1;
    var dd = yesterday.getDate();
    var nowDate = yy + '-' + mm + '-' + dd;
    var nowMonthTxt = $('#month-num').text();
    var nowmonthDate = yy + '-' + nowMonthTxt;
    if (nowMonthTxt > 7) {
        var sixMonthAgo = yy + '-' + (nowMonthTxt - 6) + '-01'
    } else {
        var sixMonthAgo = (yy - 1) + '-' + (6 + parseInt(nowMonthTxt)) + '-01'
    }

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
    $('#loading').addClass('hide');

    //数据加载前
    function beforeJson() {
        $('#loading').removeClass('hide');
    }
    //数据加载成功
    function completeJson() {
        $('#loading').addClass('hide');
    }
    //日历渲染函数
    var changeDate;
    laydate.render({
        elem: '#month-num',
        position: 'static',
        showBottom: false,
        istoday: false,
        max: nowDate,
        change: function (value1) {
            console.log(value1)
            changeDate = value1;

            if (value) {
                stealGiftShow(value, changeDate)
                $('.steal-gift-list').html('');

            }else{
                $('#loading').addClass('hide');
                alert('请选择日期并输入主播ID')

            }
        }
    });
$('.layui-this').addClass('fff')
    // ---------------------------搜索功能函数--------------------------------------------------------------------
    // 输入框搜索功能
    var idInput = document.getElementById('idinput1');
    var value;
    console.log($('#idinput1').val())
    $('#idinput1').keydown(function (e) {
        if (e.keyCode == '13') {
                console.log('按了Enter键')
                stealGiftShow(value, changeDate)

            }
        })
    getValue();
    //获取input输入框实时内容
    function getValue() {
        var timer = null;
        idInput.oninput = function () {
            var _this = this;
            clearTimeout(timer);
            timer = setTimeout(function () {
                value = _this.value;

            })
        }
    }

    $('.box-flex-button1').click(function () {
        if (value && changeDate) {
            console.log('点击了')
            console.log(value)
            console.log(changeDate)
            $('.steal-gift-list').html('');
            stealGiftShow(value, changeDate)
        } else {

            alert('请选择日期并输入主播ID')

        }
    })
    function stealGiftShow(id, date) {
        $.when(totalYesterdayAjax(id, date)).then(data => {
            console.log(data)
            var data = data.data;
            if (data) {
                console.log('有数值')
                data.forEach(items => {
                    var senderId = items.senderid,//赠送者id
                        receiveroomId = items.receiveroomid,//接受礼物的roomid
                        nickName = items.nickName,//送礼物的人的名字
                        receiveName = items.receiveName,//接受礼物的人名字
                        giftimg = items.giftimg,//礼物图片
                        gift_price = items.gift_price,//礼物价格
                        num = items.num,//赠送礼物个数
                        sendTime = items.datetime;//赠送礼物的时间

                    var time1 = sendTime.split(' ')[0],
                        time2 = sendTime.split(' ')[1];
                    var str = `<ul style="display: flex;">
                    <li style="width: 5rem;">${time1}</li>
                    <li class="gift-time2" style="width: 1rem;">${time2}</li>
                    <li>送给</li>
                    <li style="width: 8rem;">
                        <span style="color: #039be5;">
                            <a href="http://fanxing.kugou.com/${receiveroomId}">${receiveroomId}</a>
                        </span>
                    </li>
                    <li style="width: 3rem; color:#F08201;">${num}个</li>
                    <li style="width: 0.5rem;">
                        <img src="${giftimg}" alt="礼物图像">
                    </li>
                    <li>未知</li>
                </ul>`
                    $('.steal-gift-list').append(str)
                })
            } else {
                console.log('无数值')
                $('.steal-gift-list').html('<p style="text-align: center; line-height: 40rem;">没有送礼记录!</p>');

            }
        }).fail(()=>{
            alert('数据请求错误!')

        })
    }








    //主播互刷礼物数据请求函数
    function totalYesterdayAjax(a, b, c) {
        var defer = $.Deferred();
        $.ajax({
            type: "post",
            url: "/kugou/public/index.php/home/showerlist/sendgiftlistbystar",
            data: { userId: a, date: b, pagesize: c },
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
