// WEB端
var showerMainLeft = document.getElementsByClassName('shower-main-left')[0]; //主播个人信息DOM
var showerTableRight = document.getElementsByClassName('shower-table-right')[0]; //礼物列表DOM
var date = new Date();
var splitYear = date.getFullYear();
var today = moment().add(0, 'days').format('YYYY-MM-DD'); //当前天2018-01-01
var newToday = today.split('' + splitYear + '-')[1]; //除去年的月份日期
var newMon = today.split('-')[1]; //获取月份

var calendarClickNum = 1;
var preDate = new Date(date.getTime() - 24 * 60 * 60 * 1000);
var newPreDate = getPreDate(preDate); //获取当前天的前一天
//echarts表格
var chartEarn = echarts.init(document.getElementById('main-earn')); //'macarons'
var chartRenqi = echarts.init(document.getElementById('main-renqi'));
var chartTime = echarts.init(document.getElementById('main-time'));
var chartAdd = echarts.init(document.getElementById('main-add'));
var chartRadar = echarts.init(document.getElementById("shower-radar"));
var chartGift = echarts.init(document.getElementById("gift-chart"));

var phpRoomId = $('#roomid').val();
var historyForm = document.getElementsByClassName('t-body')[0], //历史直播数据
    monthTime = moment().add(-30, 'days').format('YYYY-MM-DD'), //30天开始时间
    overTime = moment().add(-1, 'days').format('YYYY-MM-DD'),
    halfMonthTime = moment().add(-15, 'days').format('YYYY-MM-DD'), //15天开始时间
    sevenTime = moment().add(-7, 'days').format('YYYY-MM-DD'), //7天开始时间
    perMonthTime = splitYear + '-' + newMon + '-01';
console.log(perMonthTime)
//初始化日历
var tt = {
    "showerThirtyDayOnlineTime": [],
    "showerThirtyDayIncome": []
};
calendarFunction(tt)
windowResize();
var TOEXCELURL = `/kugou/public/index.php/home/exportexcel/getLivelist/begintime/${monthTime}/endtime/${overTime}/roomid/${phpRoomId}`;
var TOEXCELSTR = `<li style="height: 2rem; line-height: 2rem; background: #2bb6ce; border-radius: 4px;"><a style="color: #fff; padding: 2rem;" href="${TOEXCELURL}">导出 EXCEL</a></li>`
$('.to-excel').html(TOEXCELSTR)

// ------------------------------------------------------------------------------------------------------------------------
//主播标签函数
function newShowerMes(a) {
    var defer = $.Deferred();
    $.ajax({
        type: "post",
        url: "/kugou/public/index.php/home/showerlist/selectStarTags",
        data: {
            roomid: a
        },
        dataType: "json",
        beforeSend: beforeJson,
        complete: completeJson,
        success: function (data) {
            defer.resolve(data)
        }
    })
    return defer.promise();
}
$.when(publicFunctionIncom(phpRoomId), publicFunctionViewer(phpRoomId), publicFunctionLiveminute(phpRoomId)).done(function (dataIncome, dataViewer, dataTime) {
    var shouyiArr = parseInt(dataIncome[0].income / 100);
    var fangkeArr = parseInt(dataViewer[0].viewercount / 1);
    var timeArr = parseInt(dataTime[0].liveminute / 1);
    sentAjax(phpRoomId, shouyiArr, fangkeArr, timeArr)
})
// 日历渲染按月请求ajax函数
var chartEarn, doubleOption, timeOption;
getPerMonth(phpRoomId, perMonthTime, newMon)
function getPerMonth(a, b, id) {
    $.ajax({
        type: "post",
        url: '/kugou/public/index.php/home/showerlist/showerSevenDayInfo',
        dataType: "json",
        data: {
            roomid: a,
            month: b
        },
        beforeSend: function () {
            $('#gift-loading').removeClass('hide');
        },
        complete: function () {
            $('#gift-loading').addClass('hide');
        },
        success: function (data) {
            console.log(data)
            timeOption = function (start, end, timezone, callback) {
                backgroundColor: '#fcfcfc';
                var showerOnlineTime1 = data.showerThirtyDayOnlineTime || []; //30天在线时间
                var events = [];
                showerOnlineTime1.forEach(function (items) {
                    var start = items.date;
                    var day1 = new Date(start).getDate();
                    var day2 = new Date().getDate();
                    var time = (items.liveminute / 60).toFixed(1);
                    if (time > 0) {
                        events.push({
                            editable: false,
                            title: '直播' + time + '小时',
                            order: 2,
                            start: start, // will be parsed
                            id: id
                        });
                    } else if (day1 === day2) {
                        events.push({
                            editable: false,
                            title: '直播' + (items.liveminute / 60).toFixed(1) + '小时',
                            start: start, // will be parsed
                            color: '#9c27b0',
                            id: id

                        });
                    } else {
                        events.push({
                            editable: false,
                            title: '今日未直播',
                            start: start, // will be parsed
                            color: '#9a9aa2',
                            id: id

                        });
                    }
                });
                callback(events);
            }
            earnOption = function (start, end, timezone, callback) {
                backgroundColor: '#fcfcfc';
                var showerGetMoney1 = data.showerThirtyDayIncome || []; //30天收益
                var events = [];
                showerGetMoney1.forEach(function (items, index) {
                    var start = items.date,
                        day1 = new Date(start).getDate(),
                        day2 = new Date().getDate(),
                        sub = items.income;

                    if (sub > 0) {
                        events.push({
                            editable: false,
                            title: '收益' + addComma(parseInt(sub / 100)) + '元',
                            order: 1,
                            start: start, // will be parsed
                            color: '#f64b59',
                        });
                    }
                });
                callback(events);
            }
            doubleOption = function (start, end, timezone, callback) {
                backgroundColor: '#fcfcfc';
                var showerGetMoney1 = data.showerThirtyDayDouble || []; //30天双流直播
                var events = [];
                if (showerGetMoney1) {
                    showerGetMoney1.forEach(function (items, index) {
                        var start = items.date,
                            day1 = new Date(start).getDate(),
                            day2 = new Date().getDate(),
                            sub = items.doubleminute;
                        if (sub) {
                            events.push({
                                editable: false,
                                title: '双流' + (sub / 60).toFixed(1) + '小时',
                                order: 3,
                                start: start, // will be parsed
                                color: '#f99514',
                            });
                        }
                    });

                }
                callback(events);
            }
            //日历动态事件加载
            $('#calendar').fullCalendar('addEventSource', earnOption);
            $('#calendar').fullCalendar('addEventSource', timeOption);
            $('#calendar').fullCalendar('addEventSource', doubleOption);
        }
    });
}
//  主播信息ajax数据请求
function sentAjax(a, b, c, d, e) {
    var shouyi = b,
        fangke = c,
        shichang = d,
        getTags = e;
    $.ajax({
        type: "post",
        url: '/kugou/public/index.php/home/showerlist/showerSevenDayInfo',
        dataType: "json",
        data: {
            roomid: a
        },
        beforeSend: function () {
            $('#gift-loading').removeClass('hide');
        },
        complete: function () {
            $('#gift-loading').addClass('hide');
        },
        success: function (data) {
            console.log(data)
            calendarFunction(data);
            chartEarn.hideLoading();
            chartRenqi.hideLoading();
            chartTime.hideLoading();
            chartAdd.hideLoading();
            var showerOnlineTime = data.showerThirtyDayOnlineTime, //30天在线时间
                showerGetFans = data.showerThirtyDayFans, //30天增粉丝
                showerVisitor = data.showerThirtyDayViewer, //30天访客量人气
                showerGetMoney = data.showerThirtyDayIncome, //30天收益
                showerSelfMes = data.showerinfo; //主播个人信息
            //主播个人信息渲染
            var showerName = showerSelfMes.nickname, //主播名字
                showerImg = showerSelfMes.userlogo, //主播头像
                showerRoomName = showerName, //房间名
                showerId = showerSelfMes.userid, //主播ID
                kugouID = showerSelfMes.kugouId,
                showerLevel = showerSelfMes.starIcon,
                showerOwner = showerSelfMes.badgeicon,
                showerFans = showerSelfMes.fanscount,
                roomId = showerSelfMes.roomid; //进入房间ID
            var cc1 = showerImg.replace(/85x85.jpg/g, "200x200.jpg");
            var str1 = `<div class="row">
            <div class="col s12 m12 l12">
                <div class="row">
                    <div class="shower-main-img col s6 m6 l6">
                        <p>
                            <img src="${cc1}"alt="主播头像">
                        </p>
                    </div>
                    <div class="shower-mes-more col s6 m6 l6">
                            <div class="s12 m12 l12">
                                <span>主播昵称:${showerName}</span>
                                <span style="position: relative; top: 0.25rem;">
                                    <img src="${showerOwner}" alt="主播工会">
                                </span>
                            </div>
                            <div class="s12 m12 l12">
                                <span>等级:</span>
                                <span>
                                    <img src="${showerLevel}" alt="主播等级">
                                </span>
                            </div>
                            <div class="s12 m12 l12">
                                <span>粉丝数量:</span>
                                <span>${showerFans}</span>
                            </div>
                            <div class="s12 m12 l12">
                                <span>主播ID:</span>
                                <span>${showerId}</span>
                            </div>
                            <div class="shower-tags s12 m12 l12">
                            </div>
                    </div>
                </div>
            </div>
            <div class="col s12 m12 l12">
                <div class="shower-enter col s6 m6 l6 center-align">
                    <div class="shower-enter-son center-align">
                        <a href="http://fanxing.kugou.com/${roomId}" target="_blank">进入房间</a>
                    </div>
                </div>

            </div>
        </div>`
            showerMainLeft.innerHTML = str1;
            //----------------------------------------------------------------------------------------------------------------------
            //获取直播人气日期数组
            var data_dateArr = showerVisitor.map(function (items, index) {
                var time = items.date, //日期
                    visitor = parseInt(items.viewercount); //访客数量
                var newTime = time.split('' + splitYear + '-');
                var newTime1 = newTime[1]; //日期
                return newTime1;
            })
            var renqiDate = data_dateArr.concat(newToday);
            //获取直播时长日期数组
            var data_timeArr = showerOnlineTime.map(function (items, index) {
                var time = items.date, //日期
                    visitor = parseInt(items.onlinetime); //在线时长
                var newTime = time.split('' + splitYear + '-');
                var newTime1 = newTime[1]; //日期
                return newTime1;
            })
            var timeDate = data_timeArr.concat(newToday);
            //获取主播收益日期数组
            var data_earnArr = showerGetMoney.map(function (items, index) {
                var time = items.date; //日期
                var newTime = time.split('' + splitYear + '-');
                var newTime1 = newTime[1]; //日期
                return newTime1;
            })
            console.log(data_earnArr)
            var shouyiDate = data_earnArr.concat(newToday);
            //获取礼物收获日期数组
            var data_giftArr = showerGetMoney.map(function (items, index) {
                var time = items.date; //日期
                var newTime = time.split('' + splitYear + '-');
                var newTime1 = newTime[1]; //日期
                return newTime1;
            })
            var liwuDate = data_giftArr.concat(newToday);
            //获取新增关注日期数组
            var data_addArr = showerGetFans.map(function (items, index) {
                var time = items.date; //日期
                var newTime = time.split('' + splitYear + '-');
                var newTime1 = newTime[1]; //日期
                return newTime1;
            })
            var guanzhuDate = data_addArr.concat(newToday);
            //--------------------------------------------------------------------------------------------------------------------------
            //获取直播人气数值数组
            var count_visitorArr = showerVisitor.map(function (items, index) {
                var visitor = items.maxviewercount; //访客数量
                if (visitor == null) {
                    visitor = 0;
                }
                return parseInt(visitor);
            })
            var fangkeArr = count_visitorArr.concat(fangke);
            //获取直播时长数值数组
            var count_timeArr = showerOnlineTime.map(function (items, index) {
                var visitor = items.liveminute; //在线时长
                if (visitor == null) {
                    visitor = 0;
                }
                return visitor;
            })
            var timeArr = count_timeArr.concat(shichang);
            //获取直播收益数值数组
            var newArr = showerGetMoney.map(function (items, index) {
                var sub = parseInt(items.income / 100);
                return sub;
            })
            var shouyiArr = newArr.concat(shouyi);
            //获取新增关注数值数组
            var count_addArr = showerGetFans.map(function (items, index) {
                // var len = showerGetFans.length;
                // if (index < len - 1) {
                //     var nex = parseInt(showerGetFans[index].fanscount);
                //     var pre = parseInt(showerGetFans[index + 1].fanscount);
                // }
                // var sub = pre - nex;
                var sub = items.incfanscount;
                return sub;
            })
            // var new_count_addArr = count_addArr.map(function (items, index) {
            //     if (isNaN(count_addArr[index]) || count_addArr[index] < 0) {
            //         count_addArr[index] = 0;
            //     }
            //     return parseInt(count_addArr[index]);
            // })
            var count_addArr_zero = count_addArr.concat(0);
            //---------------------------------------------echart表格开始-------------------------------------------------------------------------------------------------------------------------------------------------------------->>>>>
            //主播收益数据配置
            var optionEarn = {
                tooltip: {
                    trigger: 'axis',
                    formatter: function (a) {
                        var relVal = "";
                        var b = a[0].$vars;
                        var c = a[0].color;
                        relVal = '' + splitYear + '-' + a[0].axisValue + '<br/>';
                        relVal += '收益' + '<span style="color:#fe6d77">' + a[0].value + '</span>' + '元';
                        // console.log(c)
                        return relVal;
                    }
                },
                title: {
                    text: '主播收益', //主标题
                    // subtext: '近30收益',//副标题
                    itemGap: 15, //z主副标题距离
                    backgroundColor: '#fe6d77',
                    left: 'left', //控制标题距离容器的左边位置,可以具体的数字,百分比
                    textStyle: { //主标题字体设置
                        align: 'right',
                        // textShadowColor: 'blue',
                        color: '#fff'
                    },
                    // subtextStyle: {//副标题字体设置
                    //     color: '#fff',
                    //     align: 'right'
                    // }
                },
                // grid: [

                //     // { x: '4%', y: '20%', width: '95%', height: '50%' },
                //     // {x2: '3%', y: '7%', width: '38%', height: '38%'},
                //     // {x: '7%', y2: '7%', width: '38%', height: '38%'},
                //     // {x2: '2%', y2: '20%', width: '90%', height: '50%'},
                // ],
                legend: {
                    show: true,
                    orient: 'horizontal',
                    backgroundColor: 'rgba(0,0,0,0)',
                    data: ['主播收益'],
                    textStyle: {
                        color: '#1a1a1a'
                    }
                },
                toolbox: {
                    show: true,
                    feature: {
                        mark: {
                            show: true
                        },
                        dataView: {
                            show: true,
                            readOnly: true
                        },
                        magicType: {
                            show: true,
                            type: ['line', 'bar']
                        },
                        restore: {
                            show: true
                        },
                        saveAsImage: {}
                    }
                },
                calculable: true,
                xAxis: {
                    //    show: false,
                    type: 'category',
                    // boundaryGap : false,
                    // boundaryGap: ['20%', '20%'],
                    data: data_earnArr,
                    boundaryGap: '0%', //数值从坐标轴原点开始
                    axisPointer: {
                        show: true,
                        type: 'line',
                        lineStyle: {
                            color: '#fe6d77',
                            type: 'dotted'
                        }
                    },
                    axisLine: {
                        lineStyle: {
                            color: '#1a1a1a',
                            width: 1,
                        }
                    },
                    axisTick: {
                        alignWithLabel: true
                    },

                },
                yAxis: {
                    type: 'value',
                    boundaryGap: '0%',
                    // splitLine: {
                    //     show: false
                    // },
                    axisPointer: {
                        show: true,
                        type: 'line',
                        lineStyle: {
                            color: '#fe6d77',
                            type: 'dotted'
                        }
                    },
                    axisLine: {
                        lineStyle: {
                            color: '#1a1a1a',
                            width: 1,
                        }
                    }
                    // data:  [0,1,2,2,2,3,4,4,5,6,6,7,34,67,3,89,45,13,45,36,45]
                },
                series: [{
                    name: '主播收益',
                    type: 'line',
                    smooth: 0.5,
                    itemStyle: {
                        normal: {
                            color: '#fe6d77'
                        }
                    },
                    areaStyle: {
                        normal: {
                            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                                offset: 0,
                                color: 'rgb(255, 70, 131)'
                            }, {
                                offset: 1,
                                color: 'rgb(255, 158, 68)'
                            }])
                        }
                    },
                    data: shouyiArr
                }, ]
            };
            //主播人气数据配置
            var optionRenqi = {
                tooltip: {
                    trigger: 'axis',
                    formatter: function (a) {
                        // console.log(88888888)
                        var relVal = "";
                        var b = a[0].$vars;
                        var c = a[0].color;

                        relVal = '' + splitYear + '-' + a[0].axisValue + '<br/>';
                        relVal += '高峰' + '<span style="color:#71bcff">' + a[0].value + '</span>' + '人观看';

                        // console.log(c)
                        return relVal;
                    }
                },
                title: {
                    text: '主播人气', //主标题
                    // subtext: '近30收益',//副标题
                    itemGap: 15, //z主副标题距离
                    backgroundColor: '#71bcff',
                    left: 'left', //控制标题距离容器的左边位置,可以具体的数字,百分比
                    textStyle: {
                        align: 'right',
                        // textShadowColor: 'red',
                        color: '#fff'
                    },
                    subtextStyle: {
                        color: '#fff',
                        align: 'right'
                    }
                },
                grid: [

                    {
                        x: '4%',
                        y: '20%',
                        width: '95%',
                        height: '50%'
                    },
                    // {x2: '3%', y: '7%', width: '38%', height: '38%'},
                    // {x: '7%', y2: '7%', width: '38%', height: '38%'},
                    // {x2: '2%', y2: '20%', width: '90%', height: '50%'},
                ],
                legend: {
                    show: true,
                    orient: 'horizontal',
                    backgroundColor: 'rgba(0,0,0,0)',
                    data: ['主播人气'],
                    textStyle: {
                        color: '#1a1a1a'
                    }
                },
                toolbox: {
                    show: true,
                    feature: {
                        mark: {
                            show: true
                        },
                        dataView: {
                            show: true,
                            readOnly: true
                        },
                        magicType: {
                            show: true,
                            type: ['line', 'bar']
                        },
                        restore: {
                            show: true
                        },
                        saveAsImage: {}
                    }
                },
                calculable: true,
                xAxis: {
                    //    show: false,
                    type: 'category',
                    // boundaryGap : false,
                    // boundaryGap: ['20%', '20%'],
                    data: renqiDate,
                    // splitLine: {
                    //     show: false
                    // },
                    boundaryGap: '0%', //数值从坐标轴原点开始
                    axisPointer: {
                        show: true,
                        type: 'line',
                        lineStyle: {
                            color: '#71bcff',
                            type: 'dotted'
                        }
                    },
                    axisLine: {
                        lineStyle: {
                            color: '#1a1a1a',
                            width: 1,
                        }
                    },
                    axisTick: {
                        alignWithLabel: true
                    },

                },
                yAxis: {
                    type: 'value',
                    boundaryGap: '0%',
                    axisPointer: {
                        show: true,
                        type: 'line',
                        lineStyle: {
                            color: '#71bcff',
                            type: 'dotted'
                        }
                    },
                    axisLine: {
                        lineStyle: {
                            color: '#1a1a1a',
                            width: 1,
                        }
                    }

                    // data:  [0,1,2,2,2,3,4,4,5,6,6,7,34,67,3,89,45,13,45,36,45]
                },
                series: [{
                    name: '主播人气',
                    type: 'line',
                    smooth: true,
                    itemStyle: {
                        normal: {
                            color: '#71bcff'
                        }
                    },
                    areaStyle: {
                        normal: {
                            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                                offset: 0,
                                color: '#71bcff'
                            }, {
                                offset: 1,
                                color: '#cbe5fb'
                            }])
                        }
                    },
                    data: fangkeArr
                }, ]
            };
            //主播时长数据配置
            var optionTime = {
                tooltip: {
                    trigger: 'axis',
                    formatter: function (a) {
                        // console.log(88888888)
                        var relVal = "";
                        var b = a[0].$vars;
                        var c = a[0].color;
                        var t = a[0].value / 60;
                        var h = t.toFixed(1);
                        relVal = '' + splitYear + '-' + a[0].axisValue + '<br/>';
                        relVal += '直播' + '<span style="color:#feb842">' + h + '</span>' + '小时';
                        // console.log(c)
                        return relVal;
                    }
                },
                title: {
                    text: '主播时长', //主标题
                    // subtext: '近30收益',//副标题
                    itemGap: 15, //z主副标题距离
                    backgroundColor: '#00acc1',
                    left: 'left', //控制标题距离容器的左边位置,可以具体的数字,百分比
                    textStyle: {
                        align: 'right',
                        textShadowColor: 'red',
                        color: '#fff'
                    },
                    subtextStyle: {
                        color: '#fff',
                        align: 'right'
                    }
                },
                grid: [

                    {
                        x: '4%',
                        y: '20%',
                        width: '95%',
                        height: '50%'
                    },
                    // {x2: '3%', y: '7%', width: '38%', height: '38%'},
                    // {x: '7%', y2: '7%', width: '38%', height: '38%'},
                    // {x2: '2%', y2: '20%', width: '90%', height: '50%'},
                ],
                legend: {
                    show: true,
                    orient: 'horizontal',
                    backgroundColor: 'rgba(0,0,0,0)',
                    data: ['主播时长'],
                    textStyle: {
                        color: '#1a1a1a'
                    }
                },
                toolbox: {
                    show: true,
                    feature: {
                        mark: {
                            show: true
                        },
                        dataView: {
                            show: true,
                            readOnly: true
                        },
                        magicType: {
                            show: true,
                            type: ['line', 'bar']
                        },
                        restore: {
                            show: true
                        },
                        saveAsImage: {}
                    }
                },
                calculable: true,
                xAxis: {
                    //    show: false,
                    type: 'category',
                    // boundaryGap : false,
                    // boundaryGap: ['20%', '20%'],
                    data: data_timeArr,
                    // splitLine: {
                    //     show: false
                    // },
                    boundaryGap: '0%', //数值从坐标轴原点开始
                    axisPointer: {
                        show: true,
                        type: 'line',
                        lineStyle: {
                            color: '#00acc1',
                            type: 'dotted'
                        }
                    },
                    axisLine: {
                        lineStyle: {
                            color: '#1a1a1a',
                            width: 1,
                        }
                    },
                    axisTick: {
                        alignWithLabel: true
                    },

                },
                yAxis: {
                    type: 'value',
                    boundaryGap: '0%',
                    axisPointer: {
                        show: true,
                        type: 'line',
                        lineStyle: {
                            color: '#00acc1',
                            type: 'dotted'
                        }
                    },
                    axisLine: {
                        lineStyle: {
                            color: '#1a1a1a',
                            width: 1,
                        }
                    }
                    // data:  [0,1,2,2,2,3,4,4,5,6,6,7,34,67,3,89,45,13,45,36,45]
                },
                series: [{
                    name: '主播时长',
                    type: 'line',
                    smooth: true,
                    itemStyle: {
                        normal: {
                            color: '#00acc1'
                        }
                    },
                    areaStyle: {
                        normal: {
                            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                                offset: 0,
                                color: '#00acc1'
                            }, {
                                offset: 1,
                                color: '#b7e9f6'
                            }])
                        }
                    },
                    data: timeArr
                }, ]
            };
            //主播新增关注数据配置
            var optionAdd = {
                tooltip: {
                    trigger: 'axis',
                    formatter: function (a) {
                        // console.log(88888888)
                        var relVal = "";
                        var b = a[0].$vars;
                        var c = a[0].color;
                        var t = c / 60;

                        relVal = '' + splitYear + '-' + a[0].axisValue + '<br/>';
                        relVal += '今日新增' + '<span style="color:#71bcff">' + a[0].value + '</span>' + '人';

                        // console.log(c)
                        return relVal;
                    }
                },
                title: {
                    text: '新增关注', //主标题
                    // subtext: '近30收益',//副标题
                    itemGap: 15, //z主副标题距离
                    backgroundColor: '#feb842',
                    left: 'left', //控制标题距离容器的左边位置,可以具体的数字,百分比
                    textStyle: {
                        align: 'right',
                        // textShadowColor: 'red',
                        color: '#fff'
                    },
                    subtextStyle: {
                        color: '#fff',
                        align: 'right'
                    }
                },
                grid: [

                    {
                        x: '4%',
                        y: '20%',
                        width: '95%',
                        height: '50%'
                    },
                    // {x2: '3%', y: '7%', width: '38%', height: '38%'},
                    // {x: '7%', y2: '7%', width: '38%', height: '38%'},
                    // {x2: '2%', y2: '20%', width: '90%', height: '50%'},
                ],
                legend: {
                    show: true,
                    orient: 'horizontal',
                    backgroundColor: 'rgba(0,0,0,0)',
                    data: ['新增关注'],
                    textStyle: {
                        color: '#1a1a1a'
                    }
                },
                toolbox: {
                    show: true,
                    feature: {
                        mark: {
                            show: true
                        },
                        dataView: {
                            show: true,
                            readOnly: true
                        },
                        magicType: {
                            show: true,
                            type: ['line', 'bar']
                        },
                        restore: {
                            show: true
                        },
                        saveAsImage: {}
                    }
                },
                calculable: true,
                xAxis: {
                    //    show: false,
                    type: 'category',
                    // boundaryGap : false,
                    // boundaryGap: ['20%', '20%'],
                    data: guanzhuDate,
                    // splitLine: {
                    //     show: false
                    // },
                    boundaryGap: '0%', //数值从坐标轴原点开始
                    axisPointer: {
                        show: true,
                        type: 'line',
                        lineStyle: {
                            color: '#feb842',
                            type: 'dotted'
                        }
                    },
                    axisLine: {
                        lineStyle: {
                            color: '#1a1a1a',
                            width: 1,
                        }
                    },
                    axisTick: {
                        alignWithLabel: true
                    },

                },
                yAxis: {
                    type: 'value',
                    boundaryGap: '0%',
                    axisPointer: {
                        show: true,
                        type: 'line',
                        lineStyle: {
                            color: '#feb842',
                            type: 'dotted'
                        }
                    },
                    axisLine: {
                        lineStyle: {
                            color: '#1a1a1a',
                            width: 1,
                        }
                    }
                    // data:  [0,1,2,2,2,3,4,4,5,6,6,7,34,67,3,89,45,13,45,36,45]
                },
                series: [{
                    name: '新增关注',
                    type: 'line',
                    smooth: true,
                    itemStyle: {
                        normal: {
                            color: '#feb842'
                        }
                    },
                    areaStyle: {
                        normal: {
                            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                                offset: 0,
                                color: '#feb842'
                            }, {
                                offset: 1,
                                color: '#ffe1af'
                            }])
                        }
                    },
                    data: count_addArr_zero
                }, ]
            };
            chartEarn.setOption(optionEarn);
            chartRenqi.setOption(optionRenqi);
            chartTime.setOption(optionTime);
            chartAdd.setOption(optionAdd);
            $(window).resize(function () {
                chartEarn.resize();
                chartRenqi.resize();
                chartTime.resize();
                chartAdd.resize();
            });
            window.onresize = chartEarn.resize();
            window.onresize = chartRenqi.resize();
            window.onresize = chartTime.resize();
            window.onresize = chartAdd.resize();
            //主播标签渲染
            $.when(newShowerMes(phpRoomId)).done(function (data) {
                var tagsArr = data;
                if (tagsArr) {
                    tagsArr.forEach(function (items) {
                        var color = items.tagsColor,
                            tagsName = items.tagsName;
                        var str = '<span style="color: ' + color + ';"><span style="border: 1px solid ' + color + '; background: #ffffff; padding: 0px 6px;">' + tagsName + '</span></span>'
                        $('.shower-tags').append(str)
                    })
                }
            })
        }
    });
}
//主播收益假数据
var optionEarn1 = {
    tooltip: {
        trigger: 'axis',
    },
    title: {
        text: '主播收益', //主标题
        // subtext: '近30收益',//副标题
        itemGap: 15, //z主副标题距离
        backgroundColor: '#f93378',
        left: 'left', //控制标题距离容器的左边位置,可以具体的数字,百分比
        textStyle: {
            align: 'right',
            textShadowColor: 'red',
            color: '#fff'
        },
        subtextStyle: {
            color: '#fff',
            align: 'right'
        }
    },
    grid: [{
            x: '4%',
            y: '20%',
            width: '95%',
            height: '50%'
        },
        // {x2: '3%', y: '7%', width: '38%', height: '38%'},
        // {x: '7%', y2: '7%', width: '38%', height: '38%'},
        // {x2: '2%', y2: '20%', width: '90%', height: '50%'},
    ],
    legend: {
        show: true,
        orient: 'horizontal',
        backgroundColor: 'rgba(0,0,0,0)',
        data: ['主播收益']
    },
    toolbox: {
        show: true,
        feature: {
            mark: {
                show: true
            },
            dataView: {
                show: true,
                readOnly: true
            },
            magicType: {
                show: true,
                type: ['line', 'bar']
            },
            restore: {
                show: true
            },
            saveAsImage: {}
        }
    },
    calculable: true,
    xAxis: {
        //    show: false,
        type: 'category',
        // boundaryGap : false,
        // boundaryGap: ['20%', '20%'],
        data: [],
        // splitLine: {
        //     show: false
        // },
        boundaryGap: '0%', //数值从坐标轴原点开始
    },
    yAxis: {
        type: 'value',
        boundaryGap: '0%',
        // data:  [0,1,2,2,2,3,4,4,5,6,6,7,34,67,3,89,45,13,45,36,45]
    },
    series: [{
        name: '主播收益',
        type: 'line',
        smooth: true,
        itemStyle: {
            normal: {
                color: 'rgb(255, 70, 131)'
            }
        },
        areaStyle: {
            normal: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                    offset: 0,
                    color: 'rgb(255, 158, 68)'
                }, {
                    offset: 1,
                    color: 'rgb(255, 70, 131)'
                }])
            }
        },
        data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, ]
    }, ]
};
//主播时长假数据
var optionRenqi1 = {
    tooltip: {
        trigger: 'axis',
    },
    title: {
        text: '主播人气', //主标题
        // subtext: '近30收益',//副标题
        itemGap: 15, //z主副标题距离
        backgroundColor: '#f93378',
        left: 'left', //控制标题距离容器的左边位置,可以具体的数字,百分比
        textStyle: {
            align: 'right',
            textShadowColor: 'red',
            color: '#fff'
        },
        subtextStyle: {
            color: '#fff',
            align: 'right'
        }
    },
    grid: [

        {
            x: '4%',
            y: '20%',
            width: '95%',
            height: '50%'
        },
        // {x2: '3%', y: '7%', width: '38%', height: '38%'},
        // {x: '7%', y2: '7%', width: '38%', height: '38%'},
        // {x2: '2%', y2: '20%', width: '90%', height: '50%'},
    ],
    legend: {
        show: true,
        orient: 'horizontal',
        backgroundColor: 'rgba(0,0,0,0)',
        data: ['主播人气']
    },
    toolbox: {
        show: true,
        feature: {
            mark: {
                show: true
            },
            dataView: {
                show: true,
                readOnly: true
            },
            magicType: {
                show: true,
                type: ['line', 'bar']
            },
            restore: {
                show: true
            },
            saveAsImage: {}
        }
    },
    calculable: true,
    xAxis: {
        //    show: false,
        type: 'category',
        // boundaryGap : false,
        // boundaryGap: ['20%', '20%'],
        data: [],
        // splitLine: {
        //     show: false
        // },
        boundaryGap: '0%', //数值从坐标轴原点开始
    },
    yAxis: {
        type: 'value',
        boundaryGap: '0%',
    },
    series: [{
        name: '主播人气',
        type: 'line',
        smooth: true,
        itemStyle: {
            normal: {
                color: 'rgb(255, 70, 131)'
            }
        },
        areaStyle: {
            normal: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                    offset: 0,
                    color: 'rgb(255, 158, 68)'
                }, {
                    offset: 1,
                    color: 'rgb(255, 70, 131)'
                }])
            }
        },
        data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, ]
    }, ]
};
//主播人气假数据
var optionTime1 = {
    tooltip: {
        trigger: 'axis',
    },
    title: {
        text: '主播时长', //主标题
        // subtext: '近30收益',//副标题
        itemGap: 15, //z主副标题距离
        backgroundColor: '#f93378',
        left: 'left', //控制标题距离容器的左边位置,可以具体的数字,百分比
        textStyle: {
            align: 'right',
            textShadowColor: 'red',
            color: '#fff'
        },
        subtextStyle: {
            color: '#fff',
            align: 'right'
        }
    },
    grid: [

        {
            x: '4%',
            y: '20%',
            width: '95%',
            height: '50%'
        },
        // {x2: '3%', y: '7%', width: '38%', height: '38%'},
        // {x: '7%', y2: '7%', width: '38%', height: '38%'},
        // {x2: '2%', y2: '20%', width: '90%', height: '50%'},
    ],
    legend: {
        show: true,
        orient: 'horizontal',
        backgroundColor: 'rgba(0,0,0,0)',
        data: ['主播时长']
    },
    toolbox: {
        show: true,
        feature: {
            mark: {
                show: true
            },
            dataView: {
                show: true,
                readOnly: true
            },
            magicType: {
                show: true,
                type: ['line', 'bar']
            },
            restore: {
                show: true
            },
            saveAsImage: {}
        }
    },
    calculable: true,
    xAxis: {
        //    show: false,
        type: 'category',
        // boundaryGap : false,
        // boundaryGap: ['20%', '20%'],
        data: [],
        // splitLine: {
        //     show: false
        // },
        boundaryGap: '0%', //数值从坐标轴原点开始
    },
    yAxis: {
        type: 'value',
        boundaryGap: '0%',
    },
    series: [{
        name: '主播时长',
        type: 'line',
        smooth: true,
        itemStyle: {
            normal: {
                color: 'rgb(255, 70, 131)'
            }
        },
        areaStyle: {
            normal: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                    offset: 0,
                    color: 'rgb(255, 158, 68)'
                }, {
                    offset: 1,
                    color: 'rgb(255, 70, 131)'
                }])
            }
        },
        data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, ]
    }, ]
};
//主播新增关注假数据
var optionAdd1 = {
    tooltip: {
        trigger: 'axis',
    },
    title: {
        text: '新增关注', //主标题
        // subtext: '近30收益',//副标题
        itemGap: 15, //z主副标题距离
        backgroundColor: '#f93378',
        left: 'left', //控制标题距离容器的左边位置,可以具体的数字,百分比
        textStyle: {
            align: 'right',
            textShadowColor: 'red',
            color: '#fff'
        },
        subtextStyle: {
            color: '#fff',
            align: 'right'
        }
    },
    grid: [

        {
            x: '4%',
            y: '20%',
            width: '95%',
            height: '50%'
        },
        // {x2: '3%', y: '7%', width: '38%', height: '38%'},
        // {x: '7%', y2: '7%', width: '38%', height: '38%'},
        // {x2: '2%', y2: '20%', width: '90%', height: '50%'},
    ],
    legend: {
        show: true,
        orient: 'horizontal',
        backgroundColor: 'rgba(0,0,0,0)',
        data: ['新增关注']
    },
    toolbox: {
        show: true,
        feature: {
            mark: {
                show: true
            },
            dataView: {
                show: true,
                readOnly: true
            },
            magicType: {
                show: true,
                type: ['line', 'bar']
            },
            restore: {
                show: true
            },
            saveAsImage: {}
        }
    },
    calculable: true,
    xAxis: {
        //    show: false,
        type: 'category',
        // boundaryGap : false,
        // boundaryGap: ['20%', '20%'],
        data: [],
        // splitLine: {
        //     show: false
        // },
        boundaryGap: '0%', //数值从坐标轴原点开始
    },
    yAxis: {
        type: 'value',
        boundaryGap: '0%',
        // data:  [0,1,2,2,2,3,4,4,5,6,6,7,34,67,3,89,45,13,45,36,45]
    },
    series: [{
        name: '新增关注',
        type: 'line',
        smooth: true,
        itemStyle: {
            normal: {
                color: 'rgb(255, 70, 131)'
            }
        },
        areaStyle: {
            normal: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                    offset: 0,
                    color: 'rgb(255, 158, 68)'
                }, {
                    offset: 1,
                    color: 'rgb(255, 70, 131)'
                }])
            }
        },
        data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, ]
    }, ]
};
chartEarn.setOption(optionEarn1);
chartTime.setOption(optionTime1);
chartRenqi.setOption(optionRenqi1);
chartAdd.setOption(optionAdd1);
//数据加载前
function beforeJson() {
    $('#gift-loading').removeClass('hide');
}
//数据加载成功
function completeJson() {
    $('#gift-loading').addClass('hide');
}
//echarts自带loading加载
chartEarn.showLoading({
    text: '数据加载中...',
    color: '#c23531',
    textColor: '#000',
    maskColor: 'rgba(255, 255, 255, 0)',
    zlevel: 0
});
chartRenqi.showLoading({
    text: '数据加载中...',
    color: '#c23531',
    textColor: '#000',
    maskColor: 'rgba(255, 255, 255, 0)',
    zlevel: 0
});
chartTime.showLoading({
    text: '数据加载中...',
    color: '#c23531',
    textColor: '#000',
    maskColor: 'rgba(255, 255, 255, 0)',
    zlevel: 0
});
chartAdd.showLoading({
    text: '数据加载中...',
    color: '#c23531',
    textColor: '#000',
    maskColor: 'rgba(255, 255, 255, 0)',
    zlevel: 0
});
chartRadar.showLoading({
    text: '数据加载中...',
    color: '#c23531',
    textColor: '#000',
    maskColor: 'rgba(255, 255, 255, 0)',
    zlevel: 0
});
//访客来源ajax数据请求
function sentRadarAjax(a, b, c) {
    $.ajax({
        type: "post",
        url: '/kugou/public/index.php/home/showerlist/vistorByRoomid',
        dataType: "json",
        data: {
            begintime: a,
            endtime: b,
            roomid: c
        },
        success: sentRadarJson,
        complete: completeJson
    });
}
sentRadarAjax(monthTime, today, phpRoomId);
//访客来源数据成功回调函数
function sentRadarJson(data) {
    chartRadar.hideLoading();
    var data = data[0];
    var duanshipin = data.duanshipin, //短视频
        fenxiang = data.fenxiang, //分享
        fujin = data.fujin, //附近的人
        geci = data.geci, //歌词
        guanzhu = data.guanzhu, //关注
        huigui = data.huigui, //回归
        jiabing = data.jiabing, //嘉宾
        sousuo = data.sousuo, //搜索
        tianshu = data.tianshu, //天书
        tongcheng = data.tongcheng, //同城
        toutiao = data.toutiao, //头条
        tuiguang = data.tuiguang, //推广
        yaoqing = data.yaoqing, //邀请
        yinyue = data.yinyue; //音乐
    //主播雷达图
    var optionRadar = {
        tooltip: {
            trigger: 'axis',
            axisPointer: { // 坐标轴指示器，坐标轴触发有效
                type: 'shadow' // 默认为直线，可选为：'line' | 'shadow'
            }
        },
        title: {
            text: '访客来源'
        },
        grid: [{
                x: '10%',
                y: '30%',
                width: '90%',
                height: '40%'
            },
            {
                x2: '30%',
                y2: '30%',
                width: '90%',
                height: '40%'
            }
        ],
        xAxis: [{
            type: 'category',
            data: ['同城', '歌词', '短视频', '分享', '回归', '头条', '推广', '邀请', '搜索', '音乐', '附近', '嘉宾', '关注'],
            axisTick: {
                alignWithLabel: true
            },
            axisLine: {
                lineStyle: {
                    color: '#fff',
                }
            },
            axisLabel: {
                fontSize: 12,
                fontFamily: 'Microsoft YaHei'
            },
        }],
        yAxis: [{
            type: 'value',
            axisLine: {
                lineStyle: {
                    color: '#fff',
                }
            },
            axisLabel: {
                fontSize: 12,
                fontFamily: 'Microsoft YaHei'
            }
        }, ],
        series: [{
            name: '访客人数',
            type: 'bar',
            barMinHeight: 5,
            barGap: '20%',
            barWidth: '40%',
            data: [tongcheng, geci, duanshipin, fenxiang, huigui, toutiao, tuiguang, yaoqing, sousuo, yinyue, fujin, jiabing, guanzhu],
            itemStyle: {
                //通常情况下：
                normal: {
                    //每个柱子的颜色即为colorList数组里的每一项，如果柱子数目多于colorList的长度，则柱子颜色循环使用该数组
                    color: function (params) {
                        var colorList = ['#f37570', '#80a9b0', '#fdac94', '#9bd4b9', '#ff8a5b', '#797b7f', '#7eb37e', '#7ecbce', '#7d96bc', '#9fde9a', '#ffae48', '#5c6f7b', '#de9325'];
                        return colorList[params.dataIndex];
                    }
                }
            }
        }],
    };
    chartRadar.setOption(optionRadar);
    $(window).resize(function () {
        chartRadar.resize();
    });
    window.onresize = chartRadar.resize();
}
// ---------------------------礼物列表  观众打赏排行区域--------------------------------------------------------------------------
$('.shower-table-title-fa div').click(function () {
    $(this).addClass('shower-table-title-shadow').siblings().removeClass('shower-table-title-shadow');
})
var giftChartShowNum = 1;
//礼物列表/曲线图切换按钮
$('.new-gift-css-list-change li').click(function (e) {
    $(this).addClass('new-gift-css-list-change-l').siblings().removeClass('new-gift-css-list-change-l');
    var text = e.target.innerText;
    if (text == '曲线') {
        giftChartShowNum = 2;
        $('#gift-list').addClass('opacity').siblings().removeClass('opacity');
    } else {
        giftChartShowNum = 3;
        $('#gift-chart').addClass('opacity').siblings().removeClass('opacity')
    }
})
// sentGiftAjax(phpRoomId, newPreDate)
//礼物列表ajax数据请求
function sentGiftAjax(a, b) {
    $.ajax({
        type: "post",
        url: '/kugou/public/index.php/home/showerlist/getGiftByRoomidAndDate/roomid/' + a + '/date/' + b,
        dataType: "json",
        beforeSend: beforeJson,
        complete: completeJson,
        error: function () {
            $('#new-page').html(' ');
        },
        success: function (data) {
            $('#gift-list').html(' ');
            $('.total-ul-css').html(' ');
            giftChartShow(data)
            var total = data.total,
                perList = data.list,
                perListLen = perList.length,
                num1 = Math.ceil(perListLen / 10);
            newData = sliceArr(perList, 10),
                newDataLen = newData.length;
            giftShow(newData[0]);
            totalGiftShow(total);
            $("#new-page").pagination({
                currentPage: 1,
                totalPage: num1,
                isShow: true,
                count: 5,
                kgPageText: "首页",
                endPageText: "尾页",
                prevPageText: "上一页",
                nextPageText: "下一页",
                callback: function (p) {
                    $('#gift-list').html(' ');
                    var giftPage = newData[p - 1];
                    giftShow(giftPage, p)
                }
            });
        }
    });
}
//礼物曲线渲染函数
function giftChartShow(data) {
    var data = data.starTenMinuteGiftNum;
    var dataFirst = data[0];
    if (dataFirst) {
        var year = data[0].times.split(' ')[0];
    }
    // console.log(year)
    var num = data.map(function (items) {
        var num1 = items.num;
        return num1;
    })
    var date = data.map(function (items) {
        var date1 = items.times.split(' ')[1].split(':');
        var date2 = date1[0] + ':' + date1[1];
        return date2;
    })
    // console.log(date)
    // console.log(num)
    var optionGift = {
        tooltip: {
            trigger: 'axis',
            padding: [10, 10, 65, 10],
            formatter: function (a) {
                var relVal = "";
                var b = a[0].$vars;
                var c = a[0].color;
                relVal = year + '<br/>' + a[0].axisValue + '<br/>';
                relVal += '礼物合计' + '<span style="color:#fe6d77">' + a[0].value + '</span>' + '个';
                // console.log(relVal)
                return relVal;
            }
        },
        // title: {
        //     text: '变化曲线',//主标题
        //     // subtext: '近30收益',//副标题
        //     itemGap: 15,//z主副标题距离
        //     backgroundColor: '#fe6d77',
        //     left: 'left',//控制标题距离容器的左边位置,可以具体的数字,百分比
        //     textStyle: {//主标题字体设置
        //         align: 'right',
        //         // textShadowColor: 'blue',
        //         color: '#fff'
        //     },
        //     // subtextStyle: {//副标题字体设置
        //     //     color: '#fff',
        //     //     align: 'right'
        //     // }
        // },
        // grid: [
        //     // { x: '10%', y: '10%', width: '95%', height: '75%' },
        //     // { x2: '10%', y2: '0%', width: '95%', height: '75%' }
        // ],
        legend: {
            show: true,
            orient: 'horizontal',
            backgroundColor: 'rgba(0,0,0,0)',
            data: ['变化曲线'],
            textStyle: {
                color: '#1a1a1a'
            }
        },
        calculable: true,
        xAxis: {
            //    show: false,
            type: 'category',
            // boundaryGap : false,
            // boundaryGap: ['20%', '40%'],
            data: date,
            interval: 0,
            // boundaryGap: '0% ',//数值从坐标轴原点开始
            axisPointer: {
                show: true,
                type: 'line',
                lineStyle: {
                    color: '#fe6d77',
                    type: 'dotted'
                }
            },
            axisLine: {
                lineStyle: {
                    color: '#1a1a1a',
                    width: 1,
                }
            },
            axisTick: {
                alignWithLabel: true
            },

        },
        yAxis: {
            type: 'value',
            boundaryGap: '0%',
            // splitLine: {
            //     show: false
            // },
            axisPointer: {
                show: true,
                type: 'line',
                lineStyle: {
                    color: '#fe6d77',
                    type: 'dotted'
                }
            },
            axisLine: {
                lineStyle: {
                    color: '#1a1a1a',
                    width: 1,
                }
            }
            // data:  [0,1,2,2,2,3,4,4,5,6,6,7,34,67,3,89,45,13,45,36,45]
        },
        series: [{
            name: '变化曲线',
            type: 'line',
            smooth: 0.5,
            itemStyle: {
                normal: {
                    color: '#fe6d77'
                }
            },
            areaStyle: {
                normal: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                        offset: 0,
                        color: '#f99514'
                    }, {
                        offset: 1,
                        color: '#f99514'
                    }])
                }
            },
            data: num
        }, ]
    };
    chartGift.setOption(optionGift);
    $(window).resize(function () {
        chartGift.resize();
    });
    window.onresize = chartGift.resize();

}

//礼物总数数据渲染函数
function totalGiftShow(data) {
    var len = data.length;
    for (var i = 0; i < len; i++) {
        var gift = data[i];
        var gift_img = gift.gift_img,
            gift_num = gift.num;
        var str = `<li style="width: 1rem;">
            <img src="${gift_img}" alt="礼物头像">
        </li>
            <li style="width: 2rem;">
            <span>${gift_num}个</span>
        </li>`
        $('.total-ul-css').append(str);
    }
}

//礼物单个渲染函数
function giftShow(data) {
    // console.log(data)
    var len;
    len == undefined ? len = 0 : len = data.length;
    if (data) {
        data.forEach(function (items) {
            var giftSenter = items.senderName, //送礼物的人
                giftName = items.gift_name, //礼物名字
                giftImg = items.gift_img, //礼物图片地址
                count = items.num, //礼物个数
                time = items.time, //送礼物时间
                senderId = items.senderId;
            allTime = time.split(' '),
                time1 = allTime[0], //年月日期
                time2 = allTime[1]; //时分秒
            var str = `<ul style="display: flex;">
            <li>
                <span style="color: #039be5;"><a href="/kugou/public/index.php/home/sender/detail/senderId/${senderId}">${giftSenter}</a></span>
            </li>
            <li style="width: 3rem; color:#F08201;">送出${count}个</li>
            <li style="width: 0.5rem;">
                <img src="${giftImg}" alt="礼物头像">
            </li>
            <li>${giftName}</li>
            <li style="width: 5rem;">${time1}</li>
            <li class="gift-time2" style="width: 1rem;">${time2}</li>

            </ul>`
            $('#gift-list').append(str)

        })
    } else {
        // showerTableRightSon.innerHTML = '请求错误! 请刷新页面重试!';
        // totalGift.innerHTML = '';
        $('#new-page').html(' ');
        $('#gift-list').html('<span style="text-align: center; padding-top: 30%;">没有数据!请选择其他日期查看!</span>');
    }
}
//公共函数
function totalYesterdayAjax(a, b, c) {
    // var result;
    var defer = $.Deferred();
    $.ajax({
        type: "post",
        url: "/kugou/public/index.php/home/sender/todaySenderOrderByroomid",
        data: {
            page: a,
            roomid: b,
            date: c,
            pagesize: 12
        },
        dataType: "json",
        beforeSend: beforeJson,
        complete: completeJson,
        success: function (data) {
            defer.resolve(data)
        }
    })
    return defer.promise();
}
var showerTableTitle = document.getElementsByClassName('shower-table-title-fa')[0];
//观众打赏排行榜ajax
seekerGive(1, phpRoomId, newPreDate);

function seekerGive(a, b, c) {
    $.ajax({
        type: "post",
        url: '/kugou/public/index.php/home/sender/todaySenderOrderByroomid',
        dataType: "json",
        data: {
            page: a,
            roomid: b,
            date: c,
            pagesize: 12
        },
        beforeSend: beforeJson,
        complete: completeJson,
        success: function (data) {
            var count = data.count,
                totalIncome = data.totalincome,
                data = data.data,
                num1 = Math.ceil(count / 12);
            var newData = sliceArr(data, 12);
            $('#heji').html(' ');
            $('.total-ul-css').html('');
            $('#gift-list').html(' ');
            moneyShow(newData[0], null, c, totalIncome);
            $("#new-page").pagination({
                currentPage: 1,
                totalPage: num1,
                isShow: true,
                count: 5,
                kgPageText: "首页",
                endPageText: "尾页",
                prevPageText: "上一页",
                nextPageText: "下一页",
                callback: function (p) {
                    $('#gift-list').html(' ');
                    $.when(totalYesterdayAjax(p, phpRoomId, c)).done(function (data) {
                        var totalIncome = data.totalincome;
                        var data = data.data;
                        moneyShow(data, p, c, totalIncome);
                    })
                }
            });
        }
    });
}
//打赏排行渲染函数
function moneyShow(data, p, time, totalIncome) {
    var newTotalIncome = parseInt(totalIncome / 100);
    var p;
    if (p) {
        p = p;
    } else {
        p = 1;
    }
    if (data) {
        data.forEach(function (items, index) {
            var nickName = items.nickname,
                senderId = items.senderId,
                income = parseInt(items.income / 100),
                percent = (income / newTotalIncome) * 100,
                newPercent = !isNaN(percent) ? percent.toFixed(2) : 0,
                index = (p - 1) * 12 + index + 1,
                showerImg = items.userLog;
            // if (income) {
            var str = '<ul style="display: flex; align-content: space-around;">\
                    <li style="width: 0.5rem">\
                        <span style="position: relative; top: -5px; font-weight: 300;">' + index + '</span>\
                    </li>\
                    <li style="width: 0.5rem">\
                        <img class="circle" src="' + showerImg + '" alt="金主头像">\
                    </li>\
                    <li style="color: #039be5; width: 2rem; overflow: hidden; white-space: nowrap; text-overflow:ellipsis;"><a href="/kugou/public/index.php/home/sender/detail/senderId/' + senderId + '">' + nickName + '</a></li>\
                    <li style="color: #F08201">送礼' + income + '元</li>\
                    <li>占比' + newPercent + '%</li>\
                    <li>' + time + '</li>\
                </ul>'
            // }
            $('#gift-list').append(str)
        })
    } else {
        $('#gift-list').html('<span style="text-align: center; padding-top: 30%;">没有数据!请选择其他日期查看!</span>');

    }
}
//打赏排行监听
var ee = 1;
var calendarClickDay = newPreDate;
var showerTableTitleTimer = null;
showerTableTitle.addEventListener('click', function (e) {
    clearTimeout(showerTableTitleTimer);
    console.log(calendarClickDay)
    var text = e.target.innerText;
    showerTableTitleTimer = setTimeout(function () {
        console.log('啊啊啊啊啊')
        if (text == '观众打赏排行榜') {
            ee = 2;
            $('.new-gift-css-list-change').addClass('opacity');
            $('.tips-p').addClass('opacity');

            $('#gift-chart').addClass('opacity');
            $('#gift-list').removeClass('opacity');
            $('#gift-list').html(' ');
            $('#new-page').html(' ');
            if (calendarClickNum == 2) {
                seekerGive(1, phpRoomId, calendarClickDay);
            } else {
                seekerGive(1, phpRoomId, newPreDate);
            }
        } else {
            if (giftChartShowNum == 2) {
                $('#gift-list').addClass('opacity');
                $('#gift-chart').removeClass('opacity');
            } else {
                $('#gift-list').removeClass('opacity');
                $('#gift-chart').addClass('opacity');
            }
            ee = 3;
            $('.new-gift-css-list-change').removeClass('opacity');
            $('.tips-p').removeClass('opacity');

            $('.total-ul-css').html('');
            $('#gift-list').html(' ');
            $('#heji').html('<li style="background: #fff; border-radius: 10px;"><span style = "color: #fff; font-size: 14px;">合计</span></li>');
            if (calendarClickNum == 2) {
                sentGiftAjax(phpRoomId, calendarClickDay);
            } else {
                sentGiftAjax(phpRoomId, newPreDate);
            }
        }
    }, 500)
}, false)
// --------------------------日历区域---------------------------------------------------------------------------------------------------------------------------------
function calendarFunction(data) {
    var fcDay1 = document.getElementsByClassName('fc-day-grid');
    var zh = 'zh-cn';
    var calendarClickTimer = null;
    $('#calendar').fullCalendar({
        header: {
            left: 'prev,next',
            center: 'title',
            right: 'month,basicWeek,basicDay'
        },
        firstDay: 1,
        locale: zh,
        editable: false,
        droppable: false, // this allows things to be dropped onto the calendar
        eventLimit: false, // allow "more" link when too many events
        weekMode: 'liquid', //月份的高度变化模式
        // weekNumbers: true, //显示一个月中的周数
        aspectRatio: 1.25, //日历单元格宽度与高度的比
        // height: 1000,
        // weekNumberCalculation: 'ISO',
        titleFormat: {
            month: 'YYYY年MM月', // September 2013
            week: 'YYYY年MM月', // Sep 7 - 13 2013
            day: 'MM月D日' // Tuesday, Sep 8, 2013
        },
        month: 4,
        buttonText: {
            prev: '上月', // ‹
            next: '下月', // ›
            // prevYear: '去年', // «
            // nextYear: '明年', // »
            // today: '今天',
            month: '月',
            week: '周',
            day: '天'
        },
        monthNames: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
        // dayNames: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
        dayNamesShort: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
        selectable: true,
        // eventSources: [],//事件源对象
        eventColor: '#2bb6ce',
        eventOrder: 'order',
        dayClick: function (date, jsEvent, view) {
            clearTimeout(calendarClickTimer);
            calendarClickNum = 2;
            var fcDay = document.getElementsByClassName('fc-day');
            var aa = Array.prototype.slice.call(fcDay);
            var clickDay = date.format();
            calendarClickDay = clickDay;
            calendarClickTimer = setTimeout(function () {
                if (ee == 3) {
                    $('.total-ul-css').html('');
                    $('#gift-list').html(' ');
                    sentGiftAjax(phpRoomId, clickDay)
                } else {
                    $('#gift-list').html(' ');
                    $('.total-ul-css').html('');
                    $('#heji').html('');
                    seekerGive(1, phpRoomId, clickDay)
                }
            }, 500)
        },
        //动态控制日历兄弟元素与其高度保持一致,响应用户电脑屏幕
        windowResize: function (view) {
            var calHeight = document.getElementsByClassName('shower-table-left')[0];
            var height = calHeight.offsetHeight;
            showerTableRight.style.height = height + 'px';
        },
    });
    $('.fc-other-month').html(' ')
    var timer = null;
    $('.fc-button-group').unbind('click').on('click', (e) => {
        clearTimeout(timer)
        $('.fc-other-month').html(' ')
        $('#calendar').fullCalendar('removeEventSource', earnOption);
        $('#calendar').fullCalendar('removeEventSource', timeOption);
        $('#calendar').fullCalendar('removeEventSource', doubleOption);
        timer = setTimeout(function () {
            var text = monthText = $('.fc-center').text(),
                newMonthText = monthText.substr(5, 2),
                nowMonthTime = splitYear + '-' + newMonthText + '-01';
            getPerMonth(phpRoomId, nowMonthTime)
        }, 500)
    })
}
// --------------------------------历史数据区域-------------------------------------------------------------------
//历史直播时长ajax
function history(a, b, c, d) {
    var defer = $.Deferred();
    $.ajax({
        type: "post",
        url: '/kugou/public/index.php/home/showerlist/getLivelist',
        dataType: "json",
        data: {
            begintime: a,
            endtime: b,
            roomid: c
        },
        complete: completeJson,
        success: function (data) {
            defer.resolve([data, d])
            var perListLen = data.length,
                num1 = Math.ceil(perListLen / 10);
            var newData = sliceArr(data, 10);
            historyTime(newData[0], d);
            $("#card-new-page").pagination({
                currentPage: 1,
                totalPage: num1,
                isShow: true,
                count: 5,
                kgPageText: "首页",
                endPageText: "尾页",
                prevPageText: "上一页",
                nextPageText: "下一页",
                callback: function (p) {
                    $('.shower-table-right').animate({
                        scrollTop: 0
                    }, 500);
                    // $('#loading').removeClass('hide');
                    historyForm.innerHTML = '';
                    var timePage = newData[p - 1];
                    historyTime(timePage, d)
                    console.log(p)
                }
            });

        }

    });
    return defer.promise();
}


//历史直播时长数据渲染
var cardP = document.getElementsByClassName('card-p')[0];

function historyTime(data, d) {
    data.forEach(function (items) {
        var startTime = items.starttime,
            endTime = items.endtime,
            onlineTime = items.minute,
            doubleminute = items.doubleminute,
            onlineMoney = parseInt(items.income / 100),
            h = Math.floor(onlineTime / 60);
        m = onlineTime - h * 60;
        doubleH = Math.floor(doubleminute / 60);
        doubleM = doubleminute - doubleH * 60;
        // console.log(startTime + '///////////' + doubleminute)
        var newStartTime = startTime.split(' ');
        var year = newStartTime[0].split('' + splitYear + '-')[1]; //开始时间05-14
        var hour = newStartTime[1].split(':');
        var newHour = hour[0] + ':' + hour[1]; //开始时间09:88
        var newEndTime = endTime.split(' ');
        var year1 = newEndTime[0].split('' + splitYear + '-')[1]; //结束时间05-14
        var hour1 = newEndTime[1].split(':');
        var newHour1 = hour1[0] + ':' + hour1[1]; //结束时间09:88
        var str;
        if (h > 0 && doubleminute) {
            str = '<tr>\
                        <td style="text-align: center;"><i class="iconfont icon-shumaweixiu" style="position: relative; top: 0.15rem; left: -0.2rem; color: #1681e0;"></i></td>\
                        <td>' + year + '&nbsp' + newHour + '</td>\
                        <td>' + year1 + '&nbsp' + newHour1 + '</td>\
                        <td>' + h + '小时' + m + '分钟</td>\
                        <td>' + onlineMoney + '元</td>\
                    </tr>'
        } else if (h == 0) {
            str = '<tr>\
                        <td style="text-align: center;"><i class="iconfont icon-shumaweixiu" style="position: relative; top: 0.15rem; left: -0.2rem; display: none;"></i></td>\
                        <td>' + year + '&nbsp' + newHour + '</td>\
                        <td>' + year1 + '&nbsp' + newHour1 + '</td>\
                        <td>' + m + '分钟</td>\
                        <td>' + onlineMoney + '元</td>\
                    </tr>'
        } else {
            str = '<tr>\
                        <td style="text-align: center;"><i class="iconfont icon-shumaweixiu" style="position: relative; top: 0.15rem; left: -0.2rem; display: none;"></i></td>\
                        <td>' + year + '&nbsp' + newHour + '</td>\
                        <td>' + year1 + '&nbsp' + newHour1 + '</td>\
                        <td>' + h + '小时' + m + '分钟</td>\
                        <td>' + onlineMoney + '元</td>\
                    </tr>'
        }
        historyForm.innerHTML += str;
    })
}


//历史直播数据初始化
publicHistory(monthTime, 30)
//点击切换7天 15天 30天
var cardLi = document.getElementsByClassName('card-li')[0];
cardLi.addEventListener('click', function (e) {
    var text = e.target.innerText;
    switch (text) {
        case '7天':
            publicHistory(sevenTime, 7)
            break;
        case '15天':
            publicHistory(halfMonthTime, 15)
            break;
        case '30天':
            publicHistory(monthTime, 30)
            break;
    }
}, false)
$('.card-li li').click(function () {
    $(this).addClass('li-color').siblings().removeClass('li-color');
})
//历史直播切换天数公共函数
function publicHistory(a, b) {
    $.when(history(a, overTime, phpRoomId, b)).done(function (data) {
        var d = data[1];
        var tt = [];
        var len = data[0].length;
        data[0].forEach(function (items) {
            var startTime = items.starttime,
                newStartTime = startTime.split(' '),
                year = newStartTime[0].split('' + splitYear + '-')[1];
            tt.push(year);
        })
        var rr = tt.delArr();
        var rrLen = rr.length;
        historyForm.innerHTML = '';
        cardP.innerHTML = '近' + d + '天开播' + rrLen + '天,累计' + len + '次'
    })
}
//主播30天收益全网排名函数
function compare(a) {
    var defer = $.Deferred();
    $.ajax({
        type: 'post',
        url: '/kugou/public/index.php/home/showerlist/selectUpAndDownIncomeStarByRoomid',
        data: {
            roomid: a
        },
        success: function (data) {
            defer.resolve(data);
        }
    })
    return defer.promise();
}
$.when(compare(phpRoomId)).done(function (data) {
    var chartCompare = echarts.init(document.getElementById('compare'));
    var down = data.down,
        up = data.up,
        hisName = data.star.nickname,
        hisNum = data.star.monthrank,
        hisImg = data.star.userLogo;
    hisIncome = parseInt(data.star.monthincome / 100);
    var aa = down.map(function (items) {
        var name = items.nickname,
            income = parseInt(items.monthincome / 100),
            id = items.monthrank;
        var arr = [];
        arr.push(name);
        arr.push(income);
        arr.push(id);
        arr.concat(income, id);
        return arr
    })
    var bb = up.map(function (items) {
        var name = items.nickname,
            income = parseInt(items.monthincome / 100),
            id = items.monthrank;
        var arr = [];
        arr.push(name);
        arr.push(income);
        arr.push(id);
        arr.concat(income, id);
        return arr
    })
    var totalArr = bb.concat(aa);
    var downName = down.map(function (items) {
        var name = items.nickname;
        return name;
    })
    var downIncome = down.map(function (items) {
        var income = parseInt(items.monthincome / 100);
        return income;
    })
    var upName = up.map(function (items) {
        var name = items.nickname;
        return name;
    })
    var upIncome = up.map(function (items) {
        var income = parseInt(items.monthincome / 100);
        return income;
    })

    var newDownName = downName.reverse(),
        newUpName = upName.reverse();
    var orderName = newDownName.concat(hisName, newUpName);

    var newDownIncome = downIncome.reverse(),
        newUpIncome = upIncome.reverse();
    var orderIncome = newDownIncome.concat(hisIncome, newUpIncome);

    var optionCompare = {
        title: {
            text: '主播近30天收益全网排名'
        },
        tooltip: {
            trigger: 'axis',
            formatter: function (a) {
                var relVal = "";
                var b = a[0].$vars;
                var c = a[0].color;

                relVal = '<span style="color:#fff">' + a[0].name + '</span>' + '<br/>';
                relVal += '近30天收益' + '<span style="color:#fe6d77">' + a[0].value + '</span>' + '元';

                // console.log(c)
                return relVal;
            }
        },
        legend: {
            // data: ['Step Start', 'Step Middle', 'Step End'],
            textStyle: {
                color: '#1a1a1a'
            }
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        toolbox: {
            feature: {
                // saveAsImage: {}
            }
        },
        xAxis: {
            type: 'category',
            boundaryGap: '0%',
            data: orderName,
            axisLine: {
                lineStyle: {
                    color: '#1a1a1a',
                    width: 1, //控制增加的宽度
                }
            },
            axisTick: {
                alignWithLabel: true
            }
        },
        yAxis: {
            min: 'dataMin',
            max: function (value) {
                return parseInt(value.max + (value.max - value.min) / 5);
            },
            type: 'value',
            axisLabel: {
                formatter: '{value} 元'
            },
            axisLine: {
                lineStyle: {
                    color: '#1a1a1a',
                    width: 1
                }
            }

        },
        series: [

            {
                name: '近30天收益',
                type: 'line',
                // step: 'middle',
                data: orderIncome,
                markPoint: {
                    itemStyle: {
                        normal: {
                            label: {
                                show: true,
                                color: '#fff',
                                fontSize: 16,
                                backgroundColor: '#cb2f32',
                                position: 'top',
                                padding: 4,
                                formatter: function (param) {
                                    if (param.value != '我') {
                                        return param.value;
                                    } else {
                                        return '我是第' + hisNum + '名'
                                    }
                                    //return Math.round(param.value) + ' 万'  
                                }
                            }
                        }

                    },

                    data: [{
                            name: '最小值',
                            coord: [0, orderIncome[0]],
                            value: '第' + totalArr[3][2] + '名'
                        },
                        {
                            name: '倒数2',
                            coord: [1, orderIncome[1]],
                            value: '第' + totalArr[2][2] + '名'
                        },
                        {
                            name: '我',
                            coord: [2, orderIncome[2]],
                            value: '我'
                        },
                        {
                            name: '第二',
                            coord: [3, orderIncome[3]],
                            value: '第' + totalArr[1][2] + '名'
                        },
                        {
                            name: '最大值',
                            coord: [4, orderIncome[4]],
                            value: '第' + totalArr[0][2] + '名'
                        },
                    ]
                },
            },

        ]
    };
    chartCompare.setOption(optionCompare);
    // symbol: 'image://' + hisImg
    $(window).resize(function () {
        chartCompare.resize();
    });
    window.onresize = chartCompare.resize();

    // var toolTimer = 0;
    // var toolTotal = orderName.length;
    // var count = 0;
    // var tooltip = chartCompare.tooltip;
    // function autoTip() {
    //     toolTimer = setInterval(function () {
    //         var curr = count % toolTotal;

    //         //myChart.dispatchAction({type: 'showTip', seriesIndex: '1', dataIndex: '1'});
    //         tooltip.showTip({ seriesIndex: '0', dataIndex: curr });
    //         count += 1;
    //     }, 1000);
    // }
    // autoTip();
    setTimeout(function () {

        chartCompare.dispatchAction({
            type: 'showTip',
            seriesIndex: 0, //第几条series
            dataIndex: 2, //第几个tooltip
        });
    }, 500);

})

// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//主播收益 时长 访客 实时数据函数
function publicFunctionIncom(a) {
    // var result;
    var defer = $.Deferred();

    $.ajax({
        type: "post",
        url: "/kugou/public/index.php/home/showerlist/starTodayIncome",
        data: {
            roomid: a
        },
        dataType: "json",
        beforeSend: beforeJson,
        complete: completeJson,
        success: function (data) {
            defer.resolve(data)
        }
    })
    return defer.promise();
}

function publicFunctionViewer(a) {
    // var result;
    var defer = $.Deferred();

    $.ajax({
        type: "post",
        url: "/kugou/public/index.php/home/showerlist/starTodayViewer",
        data: {
            roomid: a
        },
        dataType: "json",
        beforeSend: beforeJson,
        complete: completeJson,
        success: function (data) {
            defer.resolve(data)
        }
    })
    return defer.promise();
}

function publicFunctionLiveminute(a) {
    // var result;
    var defer = $.Deferred();

    $.ajax({
        type: "post",
        url: "/kugou/public/index.php/home/showerlist/starTodayLiveminute",
        data: {
            roomid: a
        },
        dataType: "json",
        beforeSend: beforeJson,
        complete: completeJson,
        success: function (data) {
            defer.resolve(data)
        }
    })
    return defer.promise();
}

// ---------------------------------------------------辅助函数--------------------------------------------------------------------------------------------------------------------------
//滚轮函数
// function divScroll(data, num) {
//     var lastScrollTop = 0;
//     var timer;
//     $('.shower-table-right').scroll(function () {
//         clearTimeout(timer);
//         var _this = this;
//         var nowScrollTop = $(this).scrollTop();
//         timer = setTimeout(function () {
//             var selfHeight = showerTableRight.offsetHeight,//自身高度
//                 seeHeight = showerTableRightSonFa.clientHeight,//可视高度
//                 farHeight = $(_this).scrollTop();//滚动距离
//             if (nowScrollTop > lastScrollTop) {
//                 // console.log('向下滚送')
//                 if (farHeight + selfHeight > seeHeight - 37.5 * 8) {
//                     console.log('到底了!!!!!!!!!!!')
//                     // $('#loading').removeClass('hide');

//                     if (num < data.length) {
//                         num++;

//                         giftShow(data[num]);

//                     } else {
//                         $(_this).scrollTop(0);
//                         alert('已经到底了!!!')
//                     }
//                 }
//                 // console.log('滚送距离'+ $(_this).scrollTop())
//                 // console.log('自身高度'+ showerTableRight.offsetHeight)
//                 // console.log('距离上级高度'+showerTableRightSonFa.offsetTop)
//                 // console.log('可视高度'+showerTableRightSonFa.clientHeight)
//                 // console.log( $(_this).scrollTop()+showerTableRight.offsetHeight)
//                 // console.log(showerTableRightSonFa.clientHeight-showerTableRight.offsetHeight)
//                 // console.log(showerTableRightSonFa.clientHeight/40)
//             } else {
//                 console.log('向上滚动')
//             }
//             lastScrollTop = nowScrollTop;
//         }, 200)
//     })

// }
//获取当前日期的前一天
function getPreDate(date) {
    var str1 = date.toString();
    var str2 = str1.replace(/ GMT.+$/, ''); // Or str = str.substring(0, 24)
    var d = new Date(str2);
    var a = [d.getFullYear(), d.getMonth() + 1, d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds()];
    for (var i = 0, len = a.length; i < len; i++) {
        if (a[i] < 10) {
            a[i] = '0' + a[i];
        }
    }
    var str3 = a[0] + '-' + a[1] + '-' + a[2];
    return str3;
}
//数字加点函数
function addComma(num) {
    var num = (num || 0).toString();
    var result = '';
    while (num.length > 3) {
        result = ',' + num.slice(-3) + result;
        num = num.slice(0, num.length - 3);
    }
    if (num) {
        result = num + result;
    }
    return result;
}
// 拆分数组函数
function sliceArr(arr, len) {
    var arrLen = arr.length;
    var result = [];
    for (var i = 0; i < arrLen; i += len) {
        result.push(arr.slice(i, i + len))
    }
    return result;
    console.log(result)
}
//数组去重函数
Array.prototype.delArr = function () {
    var arr = this,
        i,
        obj = {},
        result = [],
        len = arr.length;
    for (i = 0; i < arr.length; i++) {
        if (!obj[arr[i]]) { //如果能查找到，证明数组元素重复了
            obj[arr[i]] = 1;
            result.push(arr[i]);
        }
    }
    return result;
}

//动态控制日历兄弟元素与其高度保持一致,响应用户电脑屏幕
function windowResize() {
    var calHeight = document.getElementsByClassName('shower-table-left')[0];
    var height = calHeight.offsetHeight;
    showerTableRight.style.height = height + 'px';

}