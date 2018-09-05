(function () {
    console.log('对账页面')
    var yesterday = new Date();
    var yy = yesterday.getFullYear();
    var mm = yesterday.getMonth() + 1;
    mm = mm < 10 ? '0' + mm : mm;
    var nowMonth = yy + '-' + mm;
    var dd = yesterday.getDate();
    var nowDate = yy + '-' + mm + '-' + dd;
    $('#month-num').attr('placeholder', nowMonth);
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
        type: 'month',
        // position: 'static',
        showBottom: false,
        istoday: false,
        max: nowDate,
        change: function (value1) {
            console.log(value1)
            $('#month-num').val(value1)
            $('#layui-laydate1').addClass('hide')
        }
    });
    // ---------------------------对账功能核心函数------------------------------------------------------------------------------------------------------------------------------------------
    var homeValue = $('#home-earn').val() / 100;
    var perValue = $('#per-earn').val() / 100;
    var IDS = '';
    groupCheck(nowMonth)
    // 初始化分组渲染函数
    function groupCheck(month) {
        $.when(totalYesterdayAjax(month, null, 'checkGroupMoney')).then(data => {
            console.log(data)
            var groupsArr = data.map(function (items) {
                return items
            })
            groupRender(data, month)
            //点击大分组展示小分组
            $('.fa-li').on('click', function (e) {
                console.log('点击了大分组')
                // console.log($(this).attr('groupid'))
                var childrenCount = $(this).attr('checknum');
                if ($(this).hasClass('clicked')) {
                    $(this).removeClass('clicked');
                    $(this).css({
                        'margin-bottom': '0rem',
                        'transition': 'all 0.4s'
                    })
                    $(this).find('ul').css({
                        'height': '0rem',
                        'transition': 'all 0.4s'
                    })
                    $(this).find('i').css({
                        'transform': 'rotate3d(0, 0, 1, -90deg)',
                        'top': '1.5rem'
                    })
                } else {
                    $(this).addClass('clicked');
                    $(this).css({
                        'margin-bottom': childrenCount * 3 + 'rem',
                        'transition': 'all 0.4s'
                    })
                    $(this).find('ul').css({
                        'height': childrenCount * 3 + 'rem',
                        'transition': 'all 0.4s'
                    })
                    $(this).find('i').css({
                        'transform': 'rotate3d(0, 0, 1, 0deg)',
                        'top': '1.5rem'
                    })
                }
            })
            var valueF, valueB;
            $('.group-earn').on({
                focus: function () {
                    valueF = $(this).val() / 100;
                    var groupid = $(this).attr('groupid');
                    console.log('此组的ID为' + groupid)
                },
                blur: function () {
                    valueB = $(this).val() / 100;
                    var groupid = $(this).attr('groupid');
                    if (valueB == valueF) {
                        return false
                        console.log('此组比例没有变化')
                    } else {
                        console.log('此组比例发生了变化' + valueB)
                        setPercentValue(groupid, valueB)
                    }
                }
            })
            $('.check-head').unbind('click').on('click', '#group-num-order, #pay-num-order, #per-num-order, #union-num-order, #home-num-order', function (e) {
                var id = e.target.id;
                switch (id) {
                    case 'group-num-order': //按每组人数排序
                        //增删主播后要查询最新数据后排序--------->不能删!!!!!
                        renderAfterCompare('starnum', groupsArr)
                        //不查询最新数据排序------>不能删!!!!!!!!!!!!!
                        // var month = $("#month-num").val();
                        // month = month ? month : nowMonth;
                        // $.when(totalYesterdayAjax(month, null, 'checkGroupMoney')).then(data => {
                        //     data.sort(function (a, b) {
                        //         return b.starnum - a.starnum;
                        //     })
                        //     groupRender(data, month)
                        // })
                        break;
                    case 'pay-num-order': //按实发金额排序
                        renderAfterCompare('total', groupsArr)
                        break;
                    case 'per-num-order': //按主播结算排序
                        renderAfterCompare('star', groupsArr)
                        break;
                    case 'union-num-order': //按公会抽成排序
                        renderAfterCompare('company', groupsArr)
                        break;
                    case 'home-num-order': //按家族收益排序
                        renderAfterCompare('family', groupsArr)
                        break;
                    default:
                        break;
                }
            })
            listenPercentValue(IDS)
        }).fail(() => {
            alert('数据请求错误!')
        })
    }
    //渲染函数
    function groupRender(data, month) {
        $('.check-ul').empty();
        var faLen = data.length;
        if (data) {
            for (var i = 0; i < faLen; i++) {
                var groupname = data[i].groupname,
                    family = data[i].family.toFixed(2),
                    company = data[i].company.toFixed(2),
                    total = data[i].total.toFixed(2),
                    star = data[i].star.toFixed(2),
                    sonGroup = data[i].children,
                    starnum = data[i].starnum ? data[i].starnum : '0',
                    sonLen = sonGroup.length,
                    companypercent = data[i].companypercent,
                    familypercent = data[i].familypercent,
                    groupId = data[i].groupid;
                IDS += groupId + ','
                var strI = document.createElement('i');
                strI.className = 'mdi-hardware-keyboard-arrow-down sw-down fenzu-i check-i';
                var str = document.createElement('li');
                $('#home-earn').val(familypercent * 100);
                $('#per-earn').val(companypercent * 100);
                // console.log((companypercent * 100).toFixed(1))
                str.innerHTML = `<span style="flex-grow: 1;width: 3rem; text-align: right;">${groupname}<span><input groupid=${groupId} class="group-earn${groupId} group-earn" style="width: 1.5rem;color: red; height: 1.5rem;background: #fff;border: 1px solid #dcdcdc;margin-left: 5px;text-align: center;" type="text" step="0.1" value="${familypercent*100}">%</span></span>
                <span style="flex-grow: 1; width:3rem; text-align: right; color:#039be5;">
                    <span class="star-num" id="star-num${groupId}" groupid=${groupId}>${starnum}人</span>
                    <i id="add${groupId}" class="iconfont icon-shower-check-add check-add"></i>
                </span>
                <span style="flex-grow: 1;width: 5rem; text-align: right;">${star}</span>
                <span style="flex-grow: 1;width: 5rem; text-align: right;">${company}</span>
                <span style="flex-grow: 1;width: 5rem; text-align: right;">${family}</span>
                <span style="flex-grow: 1;width: 5rem; text-align: right;">${total}元</span>
                <span style="flex-grow: 1;width: 5rem; text-align: right; margin-right: 1rem;"><a class="span-a" href="/kugou/public/index.php/home/exportexcel/exportCheckStarMoney/month/${month}/groupid/${groupId}">导出EXCEL</a></span>`;
                str.setAttribute('groupid', groupId)
                if (sonLen) {
                    str.className = 'fa-li';
                    str.setAttribute('checknum', sonLen)
                } else {
                    str.className = 'no-li'
                }
                var str2 = document.createElement('ul');
                str2.className = 'check-son-ul';
                for (var j = 0; j < sonLen; j++) {
                    var sonGroupId = sonGroup[j].groupid,
                        sonFamily = sonGroup[j].family,
                        sonCompany = sonGroup[j].company,
                        sonTotal = sonGroup[j].total,
                        sonStar = sonGroup[j].star,
                        sonStarnum = sonGroup[j].starnum,
                        sonGroupName = sonGroup[j].groupname;
                    sonStarnum = sonStarnum ? sonStarnum : 0;
                    sonFamily = sonFamily ? sonFamily : '0.00',
                        sonCompany = sonCompany ? sonCompany : '0.00',
                        sonTotal = sonTotal ? sonTotal : '0.00',
                        sonStar = sonStar ? sonStar : '0.00';
                    var str3 = document.createElement('li');
                    str3.setAttribute('groupid', sonGroupId)
                    str3.innerHTML = `<span style="flex-grow: 1;width: 3rem; text-align: right;">${sonGroupName}</span>
                    <span style="flex-grow: 1; width:3rem; text-align: right; color:#039be5;"><span class="star-num" groupid=${sonGroupId}>${sonStarnum}人</span></span>
                    <span style="flex-grow: 1;width: 5rem; text-align: right;">${sonStar}</span>
                    <span style="flex-grow: 1;width: 5rem; text-align: right;">${sonCompany}</span>
                    <span style="flex-grow: 1;width: 5rem; text-align: right;">${sonFamily}</span>
                    <span style="flex-grow: 1;width: 5rem; text-align: right;">${sonTotal}元</span>
                    <span style="flex-grow: 1;width: 5rem; text-align: right; margin-right: 1rem;"><a class="span-a" href="/kugou/public/index.php/home/exportexcel/exportCheckStarMoney/month/${month}/groupid/${sonGroupId}">导出EXCEL</a></span>`;
                    str2.appendChild(str3)
                    str.appendChild(str2)
                    str.appendChild(strI);
                }
                $('.check-ul').append(str);
            }
        } else {
            console.log('无数值')
        }
    }
    //监听佣金,收益兑换百分比是否变化
    function listenPercentValue(ids) {
        var homeValue = $('#home-earn').val() / 100;
        var perValue = $('#per-earn').val() / 100;
        $('#home-earn').focus(function () {
            var homeValueF = $('#home-earn').val() / 100;
        }).blur(function () {
            var homeValueB = $('#home-earn').val() / 100;
            if (homeValueB == homeValue) {
                return false
                console.log('家族收益兑换率没变' + homeValueB)

            } else {
                setPercentValue(ids, homeValueB, perValue)
                $('#per-earn').val(perValue * 100);
                console.log('家族收益兑换率变化' + homeValueB)
            }
        })
        $('#per-earn').focus(function () {
            var perValueF = $('#per-earn').val() / 100;
        }).blur(function () {
            var perValueB = $('#per-earn').val() / 100;
            if (perValueB == perValue) {
                return false
                console.log('应发金额兑换率没变' + perValueB)
            } else {
                console.log('应发金额兑换率变化' + perValueB)
                console.log(perValueB * 100)
                setPercentValue(ids, homeValue, perValueB)
                $('#home-earn').val(homeValue * 100);
            }
        })
    }
    //设置佣金,家族收益百分比
    function setPercentValue(ids, b, c) {
        $.ajax({
            type: "post",
            url: "/kugou/public/home/clanmanage/setGroupMoney",
            data: {
                groupids: ids,
                familypercent: b,
                companypercent: c
            },
            dataType: "json",
            beforeSend: beforeJson,
            complete: completeJson,
            success: function (data) {
                console.log(data)
                location.reload()
            },
            error: function (e) {
                console.log(e)
            }
        })
    }
    // 查询各分组主播星豆数据
    function perCheck(month, id) {
        $('.per-ul').empty()
        $.when(totalYesterdayAjax(month, id, 'checkStarMoney')).then(data => {
            var len = data.length;
            $(`#star-num${id}`).text(len + '人');
            if (len) {
                data.forEach((items, index) => {
                    var groupname = items.groupname,
                        nickname = items.nickname,
                        userlogo = items.userlogo,
                        perID = items.id,
                        groupid = items.groupid,
                        star = items.star ? items.star : '0.00',
                        company = items.company ? items.company : '0.00',
                        family = items.family ? items.family : '0.00',
                        index = index + 1;
                    var str = `<li>
                    <span style="flex-grow: 1;width: 2rem;">${index}</span>
                    <span style="flex-grow: 1;width: 5rem;">${nickname}</span>
                    <span style="flex-grow: 1;width: 5rem;">
                        <img style="height: 3rem; border-radius:50%; padding: 3px 0px;" src="${userlogo}" alt="主播头像">
                    </span>
                    <span style="flex-grow: 1;width: 5rem;">${star}</span>
                    <span style="flex-grow: 1;width: 5rem;">${company}</span>
                    <span style="flex-grow: 1;width: 5rem;">${family}</span>
                    <span style="flex-grow: 1;width: 5rem;">${groupname}</span>
                    <span style="flex-grow: 1;width: 5rem;"><span class="del-x" perid=${perID} groupid=${groupid} style="background:red; padding: 2px 4px;">X</span></span>
                </li>`
                    $('.per-ul').append(str)
                })
            } else {
                $('.per-ul').html(`<span style="padding-top: 20%;">此组没有主播</span>`)
            }
        })
    }
    //从分组移除主播函数
    function deletePer(id, that, groupid, month) {
        $.ajax({
            type: 'post',
            url: '/kugou/public/home/clanmanage/deleteCheckmoneyGroupstar',
            data: {
                id: id
            },
            dataType: 'json',
            success: function (data) {
                perCheck(month, groupid)
            },
            error: function (e) {
                console.log('出错了' + e)
            }
        })
    }
    //点击加号添加主播函数
    function addPer(groupid, monthAdd) {
        layer.prompt({
            formType: 2,
            value: ' ',
            title: '请输入要添加的主播ID,确保一个ID独占一行,然后点击下方的确认按钮.',
            area: ['800px', '350px'] //自定义文本域宽高
        }, function (value, index, elem) {
            var ids = $.trim(value).split('\n').join(',');
            var len = $.trim(value).split('\n').length;
            var beforLen = parseInt($(`#star-num${groupid}`).text());
            if (!monthAdd) {
                layer.alert('请先选择日期', (index1) => {
                    layer.close(index);
                    layer.close(index1);
                });
                return false
            }
            if (!ids) {
                layer.alert('主播ID不能为空');
                return false
            }
            if (monthAdd && ids) {
                $.ajax({
                    type: "post",
                    url: "/kugou/public/home/clanmanage/insertCheckmoneyGroupstar",
                    data: {
                        userids: ids,
                        groupid: groupid,
                        month: monthAdd
                    },
                    dataType: "json",
                    beforeSend: beforeJson,
                    complete: completeJson,
                    success: function (data) {
                        $(`#star-num${groupid}`).text(beforLen + len + '人')
                    },
                    error: function (e) {
                        console.log(e)
                    }
                })
                layer.close(index);
            }
        });
    }
    //排序后重新渲染函数
    function renderAfterCompare(ele, data) {
        var month = $("#month-num").val();
        month = month ? month : nowMonth;
        data.sort(function (a, b) {
            return b[ele] - a[ele];
        })
        groupRender(data, month)

    }
    //绑定点击事件
    $(document).on('click', '.del-x, .per-x, .button-x, .span-a, .star-num, .check-add', function (e) {
        var that = $(this)
        var classX = e.target.className;
        switch (classX) {
            case 'del-x': //从分组删除主播
                var id = $(this).attr('perid');
                var groupid = $(this).attr('groupid');
                var value = $("#month-num").val();
                deletePer(id, that, groupid, value)

                break;
            case 'per-x': //隐藏分组主播详细数据
                console.log('点击了per-x,点击了叉叉')
                $('.per-name').css({
                    'left': '110%',
                    'transition': 'all 0.5s'
                })
                break;
            case 'button-x': //查询按钮
                console.log('点击了button-x')
                var value = $("#month-num").val();
                if (!value) {
                    alert('请先选择要查询的月份!')
                    $("#month-num").focus()
                    return false
                }
                groupCheck(value)
                break;
            case 'span-a':
                e.stopPropagation()
                break;
            case 'star-num': //查看分组主播详情
                var value = $("#month-num").val();
                var groupid = $(this).attr('groupid');
                $('.per-name').css({
                    'left': '30%',
                    'transition': 'all 0.5s'
                })
                $('.per-ul').empty();
                if (value) {
                    perCheck(value, groupid)
                } else {
                    perCheck(nowMonth, groupid)
                }
                break;
            default: //添加主播
                var groupid = $(this).siblings().attr('groupid');
                var monthAdd = $('#month-num').val();
                addPer(groupid, monthAdd)
                break;
        }
    })
    //分组查询星豆数据请求函数
    function totalYesterdayAjax(a, b, c) {
        var defer = $.Deferred();
        $.ajax({
            type: "post",
            url: "/kugou/public/home/clanmanage/" + c,
            data: {
                month: a,
                groupid: b
            },
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
        if (num) {
            result = num + result;
        }
        return result;
    }
    //筛选函数
    function filterShower(data, name) {
        var data = data.data;
        var newData;
        newData = data.filter(function (items, index) {
            if (items.groupname == name) {
                return true;
            }
        })
        return newData;
    }
    //排序函数
    function compare(a, b) {
        return a - b;
    }
})()