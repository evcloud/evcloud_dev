;(function () {

    //
    // 页面刷新时执行
    window.onload = function() {
        $("#nav_vm_list").addClass("active");
        get_vm_status();// 虚拟机运行状态查询更新
    };

    // 虚拟机运行状态api构建
    function build_vm_status_api(vm_uuid){
        let url = 'api/v3/vms/' + vm_uuid + '/status/';
        return build_absolute_url(url);
    }

    // 虚拟机vnc api构建
    function build_vm_vnc_api(vm_uuid){
        let url = 'api/v3/vms/' + vm_uuid + '/vnc/';
        return build_absolute_url(url);
    }

    // 虚拟机snap api构建
    function build_vm_snap_api(snap_id, remarks=null){
        let url = 'api/v3/vms/snap/' + snap_id + '/';
        if (remarks){
            url = url + '?remark=' + remarks;
        }
        return build_absolute_url(url);
    }
    // 虚拟机snap备注 api构建
    function build_vm_snap_remark_api(snap_id, remarks=null){
        let url = 'api/v3/vms/snap/' + snap_id + '/remark/';
        if (remarks){
            url = url + '?remark=' + remarks;
        }
        return build_absolute_url(url);
    }

    // 虚拟机备注 api构建
    function build_vm_remarks_api(vm_uuid, remark){
        let url = '/api/v3/vms/' + vm_uuid + '/remark/?remark='+ remark;
        return build_absolute_url(url);
    }

     // 虚拟机回滚到snap api构建
    function build_vm_rollback_snap_api(vm_uuid, snap_id){
        let url = 'api/v3/vms/' + vm_uuid + '/rollback/' + snap_id + '/';
        return build_absolute_url(url);
    }

    function get_vm_uuid() {
        return $("#id-vm-uuid").text();
    }

    // 获取并设置虚拟机的运行状态
    function get_vm_status() {
        let vmid = get_vm_uuid();
        let api = build_vm_status_api(vmid);
        let node_status = $("#vm_status_" + vmid);
        node_status.html(`<img src="/static/images/loading34.gif" width="43px"/>`);
        $.ajax({
            url: api,
            type: 'get',
            cache:false,
            success: function(data) {
                node_status.html("<span class='label label-" + VM_STATUS_LABEL[data.status.status_code] + "'>" + VM_STATUS_CN[data.status.status_code] + "</span>");
            },
        });
    }

    // 获取虚拟机vnc url
    function get_vm_vnc_url(vm_uuid){
        let api = build_vm_vnc_api(vm_uuid);
        $.ajax({
            url: api,
            type: 'post',
            success: function (data, status_text) {
                let vnc = data.vnc.url;
                window.open(vnc, '_blank');
            },
            error: function (xhr, msg, err) {
                data = xhr.responseJSON;
                msg = '打开vnc失败';
                if (data.hasOwnProperty('code_text')){
                    msg = '打开vnc失败,' + data.code_text;
                }
                alert(msg);
            }
        });
    }

    // 打开vnc点击事件
    $(".btn-vnc-open").click(function (e) {
        e.preventDefault();
        let vm_uuid = $(this).attr('data-vm-uuid');
        get_vm_vnc_url(vm_uuid);
    });

    // 刷新虚拟机状态点击事件
    $(".btn-update-vm-status").click(function (e) {
        e.preventDefault();
        get_vm_status();
    });

    //卸载硬盘
    $('.btn-disk-umount').click(function (e) {
        e.preventDefault();
        if(!confirm("确定要卸载此硬盘吗？")){
            return
        }
        let disk_uuid = $(this).attr('data-disk-uuid');
        $.ajax({
			url: build_absolute_url('/api/v3/vdisk/' + disk_uuid + '/umount/'),
			type: 'patch',
            success: function (data, status_text) {
			    $("#tr_" + disk_uuid).remove();
                alert('已成功卸载硬盘');
            },
            error: function (xhr, msg, err) {
                data = xhr.responseJSON;
                msg = '卸载硬盘失败' + msg;
                if (data.hasOwnProperty('code_text')){
                    msg = data.code_text;
                }
                alert(msg);
            }
		});
    });

    // 启动虚拟机点击事件
    $(".btn-vm-start").click(function (e) {
        e.preventDefault();

        let vm_uuid = $(this).attr('data-vm-uuid');
        let node_vm_task = $("#vm_task_" + vm_uuid);
        start_vm_ajax(vm_uuid, function () {
            node_vm_task.html(VM_TASK_CN["start"]);
        }, function () {
            node_vm_task.html("");
            get_vm_status();
        });
    });

    // 重启虚拟机点击事件
    $(".btn-vm-reboot").click(function (e) {
        e.preventDefault();
        if(!confirm('确定重启虚拟机？'))
		    return;

        let vm_uuid = $(this).attr('data-vm-uuid');
        let node_vm_task = $("#vm_task_" + vm_uuid);
        reboot_vm_ajax(vm_uuid, function () {
            node_vm_task.html(VM_TASK_CN["reboot"]);
        }, function () {
            node_vm_task.html("");
            get_vm_status();
        });
    });

    // 关机虚拟机点击事件
    $(".btn-vm-shutdown").click(function (e) {
        e.preventDefault();

        if(!confirm('确定关闭虚拟机？'))
		    return;

        let vm_uuid = $(this).attr('data-vm-uuid');
        let node_vm_task = $("#vm_task_" + vm_uuid);
        shutdown_vm_ajax(vm_uuid, function () {
            node_vm_task.html(VM_TASK_CN["shutdown"]);
        }, function () {
            node_vm_task.html("");
            get_vm_status();
        });
    });

    // 强制断电虚拟机点击事件
    $(".btn-vm-poweroff").click(function (e) {
        e.preventDefault();

        if(!confirm('确定强制断电虚拟机？'))
		    return;

        let vm_uuid = $(this).attr('data-vm-uuid');
        let node_vm_task = $("#vm_task_" + vm_uuid);
        poweroff_vm_ajax(vm_uuid, function () {
            node_vm_task.html(VM_TASK_CN["poweroff"]);
        }, function () {
            node_vm_task.html("");
            get_vm_status();
        });
    });

    function delete_vm(vm_uuid, op){
        let node_vm_task = $("#vm_task_" + vm_uuid);
        delete_vm_ajax(vm_uuid, op,
            function () {
                node_vm_task.html(VM_TASK_CN[op]);
            },
            function () {
                alert('已成功删除云主机');
                let url = $("#id-vm-list-url").attr('href');
                if (url)
                    location.href = url;
            },
            function () {
                node_vm_task.html("");
                get_vm_status();
            }
        );
    }

    // 删除虚拟机点击事件
    $(".btn-vm-delete").click(function (e) {
        e.preventDefault();

        if(!confirm('确定删除虚拟机？'))
		    return;

        let vm_uuid = $(this).attr('data-vm-uuid');
        delete_vm(vm_uuid, 'delete');
    });

    // 强制删除虚拟机点击事件
    $(".btn-vm-delete-force").click(function (e) {
        e.preventDefault();

        if(!confirm('确定强制删除虚拟机？'))
		    return;

        let vm_uuid = $(this).attr('data-vm-uuid');
        delete_vm(vm_uuid, 'delete_force');
    });

    // 虚拟机备注
    $('.edit_vm_remark').click(function (e) {
        e.preventDefault();

        let div_show = $(this).parent();
        div_show.hide();
		div_show.next().show();
    });
    // 虚拟机备注
    $('.save_vm_remark').click(function (e) {
        e.preventDefault();
        let vm_uuid = $(this).attr('vm_uuid');
        let dom_remark = $(this).prev();
        let remark = dom_remark.val();
        let div_edit = dom_remark.parent();
        let div_show = div_edit.prev();
        let api = build_vm_remarks_api(vm_uuid, remark);
        $.ajax({
			url: api,
			type: 'patch',
			success:function(data){
			    div_show.children("span:first").text(remark);
			},
            error: function(e){
			    alert('修改失败');
            },
			complete:function() {
				div_show.show();
				div_edit.hide();
			}
		});
    });

    //
    // 创建快照渲染模板
    //
    let render_vm_snap_item = template.compile(`
        <tr id="tr_snap_{{ snap.id }}">
            <td>{{ snap.id }}</td>
            <td>{{ snap.snap }}</td>
            <td>{{ snap.create_time }}</td>
            <td class="mouse-hover">
                <div>
                    <span>{{ snap.remarks }}</span>
                    <span class="mouse-hover-show edit-vm-snap-remark" title="修改备注">
                        <span class="glyphicon glyphicon-pencil"></span>
                    </span>
                </div>
                <div style="display:none">
                    <textarea id="remarks">{{ snap.remarks }}</textarea>
                    <span class="save-vm-snap-remark" title="保存备注" data-snap-id="{{ snap.id }}">
                        <span class="glyphicon glyphicon-floppy-disk" aria-hidden="true"></span>
                    </span>
                </div>
            </td>
            <td>
                <button type="button" class="btn btn-xs btn-danger btn-vm-snap-delete"
                        data-snap-id="{{ snap.id }}">删除
                </button>
                <button type="button" class="btn btn-xs btn-danger btn-vm-snap-rollback"
                        data-snap-id="{{ snap.id }}">回滚
                </button>
            </td>
        </tr>
    `);

    // 创建虚拟机系统快照点击事件
    $(".btn-vm-snap-create").click(function (e) {
        e.preventDefault();

        if(!confirm('确定创建云主机系统快照吗？'))
		    return;

        let remarks = prompt('请输入快照备注信息：');
        if (remarks === null)
            return;
        let vm_uuid = $(this).attr('data-vm-uuid');
        create_snap_vm_ajax(vm_uuid, remarks, null,
            function (data) {
                let html = render_vm_snap_item(data);
                let snap_table = $('table.table-vm-snap-list');
                if(snap_table[0]){
                    snap_table.find("tr:first").after(html);
                }else{
                    html = `<p><strong>云主机快照</strong></p>
                            <table class="table table-default table-vm-snap-list" style="word-wrap:break-word;word-break:break-all;">
                            <tr>
                                <th>ID</th>
                                <th>快照</th>
                                <th>创建时间</th>
                                <th>备注</th>
                                <th>操作</th>
                            </tr>` + html + '</table>';
                    let snap_dom = $("#id-vm-snap-content");
                    snap_dom.empty();
                    snap_dom.append(html);
                }
                alert("创建快照成功");
            }
        ,null);
    });

    // 删除虚拟机系统快照
    function delete_vm_snap_ajax(snap_id, success_func){
        let api = build_vm_snap_api(snap_id);
        $.ajax({
            url: api,
            type: 'delete',
            success: function (data, status_text, xhr) {
                if (xhr.status === 204){
                    if(typeof(success_func) === "function"){
                        success_func();
                    }
                }else{
                    alert('删除快照失败');
                }
            },
            error: function (xhr, msg, err) {
                data = xhr.responseJSON;
                msg = '删除快照失败';
                if (data.hasOwnProperty('code_text')){
                    msg = '删除快照失败,' + data.code_text;
                }
                alert(msg);
            },
        });
    }

    // 删除虚拟机系统快照点击事件
    $("#id-vm-snap-content").on('click', '.btn-vm-snap-delete', function (e) {
        e.preventDefault();

        if(!confirm('确定删除此云主机系统快照吗？'))
		    return;

        let snap_id = $(this).attr('data-snap-id');
        let tr = $(this).parents('tr');
        delete_vm_snap_ajax(snap_id, function () {
            tr.remove();
            alert('已成功删除');
        });
    });

    // 快照备注
    $("#id-vm-snap-content").on('click', '.edit-vm-snap-remark', function (e) {
        e.preventDefault();

        let div_show = $(this).parent();
        div_show.hide();
		div_show.next().show();
    });
    // 快照备注
    $("#id-vm-snap-content").on('click', '.save-vm-snap-remark', function (e) {
        e.preventDefault();
        let id = $(this).attr('data-snap-id');
        let dom_remark = $(this).prev();
        let remark = dom_remark.val();
        let div_edit = dom_remark.parent();
        let div_show = div_edit.prev();
        let api = build_vm_snap_remark_api(id, remark);
        $.ajax({
			url: api,
			type: 'patch',
			success:function(){
			    div_show.children("span:first").text(remark);
			},
            error: function(){
			    alert('修改失败');
            },
			complete:function() {
				div_show.show();
				div_edit.hide();
			}
		});
    });

    // 回滚虚拟机到指定快照
    $("#id-vm-snap-content").on('click', '.btn-vm-snap-rollback', function (e) {
        e.preventDefault();
        if(!confirm('确定回滚云主机到此快照吗？请谨慎操作。'))
		    return;

        let snap_id = $(this).attr('data-snap-id');
        let vm_uuid = get_vm_uuid();
        let api = build_vm_rollback_snap_api(vm_uuid, snap_id);
        $.ajax({
			url: api,
			type: 'post',
			success: function (data, status_text, xhr) {
                if (xhr.status === 201){
                    alert('回滚主机成功');
                }else{
                    alert('回滚主机失败');
                }
            },
            error: function(xhr, msg, err){
			    data = xhr.responseJSON;
                msg = '回滚主机失败';
                if (data.hasOwnProperty('code_text')){
                    msg = '回滚主机失败,' + data.code_text;
                }
                alert(msg);
            }
		});
    });
})();