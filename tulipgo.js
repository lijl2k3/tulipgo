function Go(options) {
    this.status = {}; //棋盘各个交叉点的状态，0为黑，1为白，-1为空点
    this.records = []; //棋谱次序记录
    this.grouprecords = [];//棋谱每一步的棋块记录
    this.turn = 0; //当前次序。0为黑，1为白
    this.ko = -1; //为判断打劫而设的变量。如果本轮有提子且提子数为1，则将该被提子的编号和当前所下子的编号记录到数组中
    this.group = {0: [], 1: []};//棋盘上所有与本色棋子连线而组成的区块+本色棋子独立而成的区块，0为黑区块组，1为白区块组
    this.captured = {0: 0, 1: 0};//被提子的数量。0为被提黑子，1为被提白子
    this.shownumber = options.shownumber | false; //是否显示棋子步序
    this.showcords = options.showcords | false; //是否显示坐标
    this.divname = options.divname; //在哪个dom中渲染棋谱
    this.boardwidth = options.boardwidth;
    //棋盘大小（现在因固定棋格宽度，暂不起作用。用于以后响应式调整棋盘大小）
    this.gridwidth=25;
    this.step=0; //棋谱步序
    this.canclick=true; //是否能够点击棋盘落子
}

//初始化棋盘
    Go.prototype.init = function () {
    let board=document.getElementById(this.divname);
        board.style.width=this.boardwidth+'px';
        board.style.height=this.boardwidth+'px';

        board.parentNode.style.width=this.boardwidth+40+'px';
        board.parentNode.style.height=this.boardwidth+60+'px';
        this.gridwidth=Math.floor(this.boardwidth/20);
        let html = this.drawBoard();

        //console.log(this.boardwidth);
        board.innerHTML = html;
        if(this.showcords){
            this.setCordinate();
        }
        let grids = document.querySelectorAll('.grid');  //棋盘交叉点集合
        grids.forEach(function (node) {// 为每个交叉点设置点击交互
            node.style.width=this.gridwidth+'px';
            node.style.height=this.gridwidth+'px';
            node.addEventListener('click', function (e) {
                if(this.canclick==false){ //判断能否点击落子
                    return;
                }
                let griddata = parseInt(e.target.getAttribute('data'));
                if (this.status[griddata] == -1) { //如果判断为空白点，则进行以下操作
                    if (this.presetStone(griddata)) {
                        this.drawStone(e.target, this.turn, griddata);
                        this.pushRecords(griddata);
                        //console.log(this.grouprecords);
                        this.turn = (this.turn == 0) ? 1 : 0; //交换落子次序
                        this.step++; //记录步序
                    }
                }
            }.bind(this))
        }.bind(this));

    }

    Go.prototype.resizeGrid=function (size) {
        this.gridwidth=size;
        let grids=document.querySelectorAll('.grid');
        grids.forEach(function (node) {
            node.style.width=size+'px';
            node.style.height=size+'px';
        }.bind(this));
        this.boardwidth=size*20;
        let board=document.getElementById(this.divname);
        board.style.width=this.boardwidth+'px';
        board.style.height=this.boardwidth+'px';
        board.parentNode.style.width=this.boardwidth+40+'px';
        board.parentNode.style.height=this.boardwidth+60+'px';
        this.clearBoard();
        this.stepTo(this.step);
        if(this.step==this.records.length){
            this.canclick=true;
        }
        if(this.showcords){
            this.clearCordinate();
            this.setCordinate();
        }
    }

    //在棋盘画面根据当前落子的次序和编号绘制棋子
    Go.prototype.drawStone = function (node, turn, gid,redraw) {
        if (turn == 0) {
            if (gid == 0) grid = 'grid_lt_b.gif';
            else if (gid == 18) grid = 'grid_lb_b.gif';
            else if (gid == 342) grid = 'grid_rt_b.gif';
            else if (gid == 360) grid = 'grid_rb_b.gif';
            else if (gid < 19) grid = 'grid_l_b.gif';
            else if (gid > 342) grid = 'grid_r_b.gif';
            else if (gid % 19 == 0) grid = 'grid_t_b.gif';
            else if (gid % 19 == 0) grid = 'grid_b_b.gif';
            else grid = 'grid_black.gif';
        }
        else {
            if (gid == 0) grid = 'grid_lt_w.gif';
            else if (gid == 18) grid = 'grid_lb_w.gif';
            else if (gid == 342) grid = 'grid_rt_w.gif';
            else if (gid == 360) grid = 'grid_rb_w.gif';
            else if (gid < 19) grid = 'grid_l_w.gif';
            else if (gid > 342) grid = 'grid_r_w.gif';
            else if (gid % 19 == 0) grid = 'grid_t_w.gif';
            else if (gid % 19 == 0) grid = 'grid_b_w.gif';
            else grid = 'grid_white.gif';
        }
        node.setAttribute('style',"background-image:url(assets/"+grid+"); line-height:"+this.gridwidth+'px');
        node.style.height=node.style.width=this.gridwidth+'px';
        if(this.shownumber==true){
            if(redraw==true){ //如果是查看状态，则用renderNum方法渲染棋子步序数字
                this.renderNum(node,gid,turn);
            }else{ //如果是落子状态，则用addNum方法添加棋子步序数字
                this.addNum(node,gid, turn);
            }

        }

    }

    //初始化棋盘，在棋盘画面上绘制361个交叉点，根据编号选择正确的交叉点图片
    Go.prototype.drawBoard = function () {
        let html = '';
        let gid = 0;
        for (let i = 0; i < 19; i++) {
            let html_row = '';
            let grid;
            for (let j = 0; j < 19; j++) {
                this.status[gid] = -1;
                if (gid == 0) grid = 'grid_lt.gif';
                else if (gid == 18) grid = 'grid_lb.gif';
                else if (gid == 342) grid = 'grid_rt.gif';
                else if (gid == 360) grid = 'grid_rb.gif';
                else if (gid == 60 || gid == 174 || gid == 288 || gid == 294 || gid == 300 || gid == 186 || gid == 72 || gid == 66 || gid == 180) grid = 'grid_star.gif';
                else if (gid < 19) grid = 'grid_l.gif';
                else if (gid > 341) grid = 'grid_r.gif';
                else if (gid % 19 == 0) grid = 'grid_t.gif';
                else if (gid % 19 == 18) grid = 'grid_b.gif';
                else grid = 'grid.gif';
                html_row += '<div class="grid" data=' + gid + ' style="background-image:url(assets/'+grid+')" ></div>';
                gid++;
            }
            html += "<div class='chesscol'>" + html_row + "</div>";
        }
        return html;
    }

    //将新落子并入棋组
    Go.prototype.joinGroup = function (gid, selfcheck) {
        let points = this.checkBorderround(gid);
        let results = [];
        for (group of this.group[this.turn]) { //循环遍历落子的邻接点，判断是否与当前某棋块连接
            let isJoin = group.some(function (data) {
                return points.some(function (point) {
                    return data.stone == point;
                })
            });
            if (isJoin) {
                results.push(group); //如连接则选出与该落子关联的棋块
            }
        }

        if (results.length > 0) { //如果有棋块，则将新子并入该棋块。(多个棋块会并为一个棋块)
            let arr = [];
            for (result of results) {
                arr = arr.concat(result);
            }
            arr.push({step:this.step+1,stone:gid});
            if (selfcheck == false) { //进行自身禁手检测
                if (this.checkEat(arr) == false) {
                    arr.pop();
                    this.status[gid] = -1;
                    return false;
                }
            }
            for (let group of results) { //删除原有棋块
                this.group[this.turn].splice(this.group[this.turn].indexOf(group), 1);
            }
            this.group[this.turn].push(arr); //并入与当前落子连接后的棋块
        }
        else {   //否则单独成立一组
            let arr = [];
            arr.push({step:this.step+1,stone:gid});
            if (selfcheck == false) {
                if (this.checkEat(arr) == false) {
                    arr.pop();
                    this.status[gid] = -1;
                    return false;
                }
            }
            this.group[this.turn].push(arr);
        }
        return true;
    }

    //计算某一棋组是否被吃
    Go.prototype.checkEat = function (group) {
        return group.some(function (data) {
            let round = this.checkBorderround(data.stone); //计算棋组中边角棋子的邻接点
            return round.some(function (data) {
                return this.status[data] == -1;
            }.bind(this))
        }.bind(this))

    }

    //走子后计算对手的整个盘面的棋块组是否有提子
    Go.prototype.checkEnemy = function (gid) {
        let color = (this.turn == 0) ? 1 : 0;
        let captured = [];
        let groupcaptured=[];
        for (let group of this.group[color]) {
            if (this.checkEat(group) == false) {
                let stones=group.map(function (data) {
                    return data.stone;
                })
                captured = captured.concat(stones); //合并所提棋子块内的棋子
                groupcaptured.push(group);
            }
        }
        if (captured.length == 1) { //如果提了一个子，则进行打劫检测
            if (!this.checkKo(gid)) {
                return -1;
            }
        }
        if (captured.length == 1) { //如果提了一子，且过了打劫检测，则设置打劫属性以备以后打劫判断
            this.ko = captured[0];
        }
        else this.ko=-1;

        this.group[color]=this.group[color].filter(function (group) {//从当前棋块中删除被提子的棋块
           for(let captured of groupcaptured){
               if(group==captured){
                   return false;
               }
           }
           return true;
        })




        this.captured[color] += captured.length; //合计对手被提子数
        return captured;
    }

    //过滤在边角上的棋子的邻近接触点
    Go.prototype.checkBorderround = function (gid) {
        let round = [gid + 1, gid - 1, gid + 19, gid - 19];
        if (gid < 19) {
            round.splice(3, 1);
        }
        if (gid > 341) {
            round.splice(2, 1);
        }
        if (gid % 19 == 0) {
            round.splice(1, 1);
        }
        if (gid % 19 == 18) {
            round.splice(0, 1);
        }
        return round;
    }

    //放下本轮棋子前，先进行的判断，根据返回值true/false判定能否落子.判断顺序：先检测是否提掉对方棋子，如提掉1颗则再判断是否打劫禁手。是打劫禁手则返回false如不是打劫禁手则设置打劫属性。如大于1子,或没有提子，则判断是否是禁手。如不是禁手则返回true
    Go.prototype.presetStone = function (griddata) {
        this.status[griddata] = this.turn; //先把该棋子编号状态改为落子状态，以便于计算对方死子，判定打劫和判定是否禁手。
        let captured = this.checkEnemy(griddata);
        if (captured == -1) {
            return false;
        }
        let result = false;
        if (captured.length > 0) {
            this.clearStone(captured); //清除死子
            result = true;
        }
        return this.joinGroup(griddata, result); //如果result为true,则在将所下棋子并入棋块时进行自身禁手判定

    }

    //清除死子，改棋子编号状态
    Go.prototype.clearStone = function (group) {
        let grids = document.querySelectorAll('.grid');
        for (let grid of group) {
            this.status[grid] = -1;
            grids[grid].setAttribute('style',"background-image:url(assets/"+this.makeGrid(grid)+")");
            grids[grid].innerText='';
            grids[grid].style.width=this.gridwidth+'px';
            grids[grid].style.height=this.gridwidth+'px';
        }
    }

    //在棋盘画面上清除死子，改变棋子编号图像
    Go.prototype.makeGrid = function (gid) {
        if (gid == 0) grid = 'grid_lt.gif';
        else if (gid == 18) grid = 'grid_lb.gif';
        else if (gid == 342) grid = 'grid_rt.gif';
        else if (gid == 360) grid = 'grid_rb.gif';
        else if (gid == 60 || gid == 174 || gid == 288 || gid == 294 || gid == 300 || gid == 186 || gid == 72 || gid == 66 || gid == 180) grid = 'grid_star.gif';
        else if (gid < 19) grid = 'grid_l.gif';
        else if (gid > 341) grid = 'grid_r.gif';
        else if (gid % 19 == 0) grid = 'grid_t.gif';
        else if (gid % 19 == 18) grid = 'grid_b.gif';
        else grid = 'grid.gif';
        return grid;
    }

    //检查是否打劫禁手。是禁手则把棋子编号状态改回-1,并返回false
    Go.prototype.checkKo = function (gid) {
        if (this.ko == gid ) {
            this.status[gid] = -1;
            return false;
        }
        return true;
    }

    //落子记录
    Go.prototype.pushRecords = function (gid) {
        this.records.push({
            turn: this.turn,
            stone: gid
        });
        let group=JSON.parse(JSON.stringify(this.group)) //将本轮的group转换为独立对象后存入grouprecords. 如果不转换，因为group每轮次都会变动，无法存入数组
        this.grouprecords.push({ko:this.ko,group:group});
        //console.log(this.grouprecords);
    }

    //给落子添加数字 node: 要渲染的dom元素，gid:dom编号, turn:黑/白
    Go.prototype.addNum=function (node,gid,turn) {
        let text=this.records.length+1;
        node.innerText=text;
        let color=(turn==0)?'white':'black';
        node.style.color=color;
    }


    // 渲染棋盘的落子步序数字 node: 要渲染的dom元素，gid:dom编号, turn:黑/白
    Go.prototype.renderNum=function (node,gid,turn) {
       //  let records=this.records.slice(0,this.step);
       //  records.reverse();
       //  let result=records.findIndex(function (item,index) {
       //      return item.stone==gid;
       //  });
       // console.log(result,gid);
        let step=this.findGridInGroup(gid,turn);
        node.innerText=step;
        let color=(turn==0)?'white':'black';
        node.style.color=color;
    }

    //在棋块中查找棋子，如找到则返回棋子步序  gid: dom编号 turn:黑/白
    Go.prototype.findGridInGroup=function (gid,turn) {
        let groups=this.grouprecords[this.step-1].group;
        for (let group of groups[turn]){
            index=group.find(function (data) {
                return gid==data.stone;
            })
            if(index!==undefined){
                return index.step;
            }

        }
    }

    //设置棋盘坐标
    Go.prototype.setCordinate=function () {
        document.getElementById(this.divname).style.width=this.boardwidth+'px';
        let cordchar='ABCDEFGHIJKLMNOPQRS';
        let cols=document.querySelectorAll('.chesscol');
        // for(let i=0;i<cols.length;i++){
        //     cols[i].map(function () {
        //         let topcord='<div class="cord">'+i+1+'</div>';
        //         return topcord+cols[i];
        //     })
        // }
        for(let i=0;i<cols.length;i++){
            let topcord=document.createElement('div');
            topcord.className='cordtop';
            topcord.innerText=i;
            topcord.style.width=this.gridwidth+'px';
            topcord.style.height=this.gridwidth+'px';
            topcord.setAttribute('style','line-height:'+this.gridwidth+'px');
            cols[i].prepend(topcord);
        }
        let html='<div class="cordtop" style="height:'+this.gridwidth+'px'+'"> </div>';
        for(let i=0;i<19;i++){
            html+='<div class="cordleft" style="line-height:'+this.gridwidth+'px;" >'+cordchar[i]+"</div>";
        }
        let leftcord=document.createElement('div');
        leftcord.className='chesscol';
        //leftcord.setAttribute('style','padding-top:'+parseInt((Math.floor(this.gridwidth/2))+24)+'px');
        leftcord.innerHTML=html;
        cols[0].before(leftcord);

    }

    //清除棋盘坐标
    Go.prototype.clearCordinate=function(){
        let cols=document.querySelectorAll('.chesscol');
        for(let i=0;i<cols.length;i++){
           cols[i].removeChild(cols[i].childNodes[0]);
        }
        let board=document.getElementById(this.divname);
        board.removeChild(document.querySelector('.chesscol'));
        //board.style.width=this.boardwidth+'px';
        board.style='margin:auto';
    }


    //查看下一步
    Go.prototype.stepNext=function () {
        if(this.step+1>this.records.length){
            return;
        }
        this.step=this.step+1;
        if(this.step==this.records.length){
            this.stepLast();
        }else{
            this.stepTo(this.step);
        }
    }

    //查看上一步
    Go.prototype.stepBack=function () {
        if(this.step-1<0){
            return;
        }
        this.step=this.step-1;
        this.stepTo(this.step);
    }

    //查看最初状态
    Go.prototype.stepFirst=function () {
        this.step=0;
        this.stepTo(0);
    }

    //查看最后一步
    Go.prototype.stepLast=function () {
        this.step=this.records.length;
        this.stepTo(this.step);
        this.canclick=true;//最后一步时设定可落子状态为true
    }

    //查看特定步序
    Go.prototype.stepTo=function (step) {
        this.step=step;
        this.clearBoard();
        this.loadBoard();
        this.redrawBoard();
        this.canclick=false; //在查看状态，设置可落子状态为false
    }

    //将棋盘各落子点恢复为初始状态
    Go.prototype.clearBoard=function () {
        for (grid in this.status){
            this.status[grid]=-1;
        }
    }

    //根据各交叉点状态渲染棋盘
    Go.prototype.redrawBoard=function () {
        let grids=document.querySelectorAll('.grid');
        for(let grid of grids){
            (function(){
                this.redraw(grid, parseInt(grid.getAttribute('data')));
            }).bind(this)(grid);
        }
    }

    //渲染具体的dom棋子
    Go.prototype.redraw=function (node,gid) {
        if(this.status[gid]!=-1){
            this.drawStone(node,this.status[gid],gid,true);
        }else{
            node.setAttribute('style',"background-image:url(assets/"+this.makeGrid(gid)+")");
            node.innerText='';
            node.style.width=node.style.height=this.gridwidth+'px';
        }
    }

    //调整棋盘在查看时的状态,填充this.status
    Go.prototype.loadBoard=function () {
        if(this.grouprecords.length>0) {
            let groups = this.grouprecords[this.step - 1].group;

            let arr = {0: [], 1: []};
            for (let color in groups) {
                for (let group of groups[color]) {
                    arr[color] = arr[color].concat(group);

                }

                for (let data of arr[color]) {
                    this.status[data.stone] = parseInt(color);
                }

            }
        }
    }

    //撤销落子
    Go.prototype.undo=function () {
        if(this.grouprecords.length==0){
            return;
        }
        let latestgroup={0:[],1:[]};
        this.grouprecords.pop();
        if(this.grouprecords.length!=0) {
            latestgroup = this.grouprecords[this.grouprecords.length - 1].group;
        }
        //console.log(latestgroup);
        this.group=JSON.parse(JSON.stringify(latestgroup));
        if(this.grouprecords.length>0) {
            this.ko = this.grouprecords[this.grouprecords.length - 1].ko;
        }
        this.records.pop();
        this.turn=(this.turn==0)?1:0;
        this.stepLast();
    }

