/*******************************************************************************
* WYSIWYG HTML Editor for Internet
*
* @author Roddy <luolonghao@gmail.com>
* @site http://www.kindsoft.net/
* @licence LGPL(http://www.opensource.org/licenses/lgpl-license.php)
* @version 3.0
*******************************************************************************/
KE.plugin['about'] = {
    click : function(id) {
        var dialog = new KE.dialog({
            id : id,
            cmd : 'about',
            width : 300,
            height : 80,
            title : KE.lang['about'],
            noButton : KE.lang['close']
        });
        dialog.show();
    }
};
KE.plugin['plainpaste'] = {
    click : function(id) {
        KE.util.selection(id);
        var dialog = new KE.dialog({
            id : id,
            cmd : 'plainpaste',
            width : 330,
            height : 300,
            title : KE.lang['plainpaste'],
            yesButton : KE.lang['yes'],
            noButton : KE.lang['no']
        });
        dialog.show();
    },
    exec : function(id) {
        KE.util.select(id);
        var dialogDoc = KE.util.getIframeDoc(KE.g[id].dialog);
        var html = KE.$('textArea', dialogDoc).value;
        var re = new RegExp("\r\n|\n|\r", "g");
        html = html.replace(re, "<br />$&");
        KE.util.insertHtml(id, html);
        KE.layout.hide(id);
        KE.util.focus(id);
    }
};
KE.plugin['wordpaste'] = {
    click : function(id) {
        KE.util.selection(id);
        var dialog = new KE.dialog({
            id : id,
            cmd : 'wordpaste',
            width : 330,
            height : 300,
            title : KE.lang['wordpaste'],
            yesButton : KE.lang['yes'],
            noButton : KE.lang['no']
        });
        dialog.show();
    },
    allowTagTable : [
        'A', 'FONT', 'SPAN', 'P', 'BR', 'DIV', 'LI', 'U', 'STRIKE',
        'STRONG', 'TABLE', 'TR', 'TD', 'TBODY', 'HR', 'BLOCKQUOTE',
        'SUB', 'SUP', 'UL', 'OL', 'IMG', 'B', 'EM', 'H1', 'H2', 'H3',
        'H4', 'H5', 'H6'
    ],
    scanNode : function(el) {
        if (el.hasChildNodes()) {
            var nodes = el.childNodes;
            for (var i = 0; i < nodes.length; i++) {
                var node = nodes[i];
                switch (node.nodeType) {
                case 1:
                    if (!KE.util.inArray(node.tagName, this.allowTagTable)) {
                        node.parentNode.removeChild(node);
                    } else {
                        if (KE.browser == 'IE') {
                            node.removeAttribute("className");
                        } else {
                            node.removeAttribute("class");
                        }
                        if (node.tagName == 'TABLE') {
                            node.setAttribute("border", 1);
                        }
                        node.removeAttribute("lang");
                        node.removeAttribute("type");
                        var fontSize = node.style.fontSize;
                        var fontFamily = node.style.fontFamily;
                        var color = node.style.color;
                        node.removeAttribute("style");
                        if (fontSize) node.style.fontSize = fontSize;
                        if (fontFamily) node.style.fontFamily = fontFamily;
                        if (color) node.style.color = color;
                        break;
                    }
                case 3:
                    break;
                default:
                    node.innerHTML = '';
                    break;
                }
                this.scanNode(node);
            }
        }
    },
    clearWordTag : function(doc) {
        this.scanNode(doc.body);
        var str = doc.body.innerHTML;
        str = str.replace(new RegExp("<meta(\n|.)*?>", "ig"), "");
        str = str.replace(new RegExp("<!(\n|.)*?>", "ig"), "");
        str = str.replace(new RegExp("<style[^>]*>(\n|.)*?</style>", "ig"), "");
        str = str.replace(new RegExp("<script[^>]*>(\n|.)*?</script>", "ig"), "");
        str = str.replace(new RegExp("<w:[^>]+>(\n|.)*?</w:[^>]+>", "ig"), "");
        str = str.replace(new RegExp("<w:[^>]*/>", "ig"), "");
        str = str.replace(new RegExp("<xml>(\n|.)*?</xml>", "ig"), "");
        str = str.replace(new RegExp("^\n+", "ig"), "");
        return str;
    },
    exec : function(id) {
        KE.util.select(id);
        var dialogDoc = KE.util.getIframeDoc(KE.g[id].dialog);
        var wordIframe = KE.$('wordIframe', dialogDoc);
        var wordDoc = KE.util.getIframeDoc(wordIframe);
        KE.util.insertHtml(id, this.clearWordTag(wordDoc));
        KE.layout.hide(id);
        KE.util.focus(id);
    }
};
KE.plugin['fullscreen'] = {
    resetFull : function(id) {
        var el = KE.util.getDocumentElement();
        var width = el.clientWidth;
        var height = el.clientHeight;
        var left,top;
        if (KE.browser == 'IE' || KE.browser == 'OPERA') {
            left = document.body.parentNode.scrollLeft;
            top = document.body.parentNode.scrollTop;
        } else {
            left = window.scrollX;
            top = window.scrollY;
        }
        var div = KE.g[id].container;
        div.style.left = left + 'px';
        div.style.top = top + 'px';
        div.style.zIndex = 19811213;
        KE.util.resize(id, width, height);
    },
    click : function(id) {
        var obj = KE.g[id];
        var resizeListener = function(event) {
            if (obj.fullscreenMode) {
                KE.plugin["fullscreen"].resetFull(id);
            }
        }
        if (obj.fullscreenMode) {
            obj.fullscreenMode = false;
            KE.util.showBottom(id);
            document.body.parentNode.style.overflow = 'auto';
            var div = KE.g[id].container;
            div.style.position = 'static';
            KE.util.resize(id, parseInt(this.width), parseInt(this.height));
            if (KE.g[id].hideBottomMode) KE.util.hideBottom(id);
            KE.event.remove(window, 'resize', resizeListener);
        } else {
            obj.fullscreenMode = true;
            this.width = obj.container.style.width;
            this.height = obj.container.style.height;
            KE.util.hideBottom(id);
            document.body.parentNode.style.overflow = 'hidden';
            var div = KE.g[id].container;
            div.style.position = 'absolute';
            this.resetFull(id);
            KE.event.add(window, 'resize', resizeListener);
        }
    }
};
KE.plugin['bgcolor'] = {
    click : function(id) {
        KE.util.selection(id);
        var menu = new KE.menu({
            id : id,
            cmd : 'bgcolor'
        });
        menu.picker();
    },
    exec : function(id, value) {
        KE.util.select(id);
        if (KE.browser == 'IE') {
            KE.g[id].iframeDoc.execCommand('backcolor', false, value);
        } else  {
            KE.g[id].iframeDoc.execCommand('hiliteColor', false, value);
        }
        KE.layout.hide(id);
        KE.util.focus(id);
    }
};
KE.plugin['date'] = {
    click : function(id) {
        var date = new Date();
        var year = date.getFullYear().toString(10);
        var month = (date.getMonth() + 1).toString(10);
        month = month.length < 2 ? '0' + month : month;
        var day = date.getDate().toString(10);
        day = day.length < 2 ? '0' + day : day;
        var value = year + '-' + month + '-' + day;
        KE.util.selection(id);
        KE.util.insertHtml(id, value);
    }
};
KE.plugin['fontname'] = {
    click : function(id) {
        var cmd = 'fontname';
        KE.util.selection(id);
        var fontName = KE.lang['fontTable'];
        var menu = new KE.menu({
            id : id,
            cmd : cmd,
            width : '160px'
        });
        for (var i in fontName) {
            var html = '<span style="font-family: ' + i + ';">' + fontName[i] + '</span>';
            menu.add(html, new Function('KE.plugin["' + cmd + '"].exec("' + id + '", "' + i + '")'));
        }
        menu.show();
    },
    exec : function(id, value) {
        KE.util.select(id);
        KE.g[id].iframeDoc.execCommand('fontname', false, value);
        KE.layout.hide(id);
        KE.util.focus(id);
    }
};
KE.plugin['fontsize'] = {
    click : function(id) {
        var fontSize = {
            '1' : '8pt',
            '2' : '10pt',
            '3' : '12pt',
            '4' : '14pt',
            '5' : '18pt',
            '6' : '24pt'
        };
        var cmd = 'fontsize';
        KE.util.selection(id);
        var menu = new KE.menu({
            id : id,
            cmd : cmd,
            width : '100px'
        });
        for (var i in fontSize) {
            var html = '<span style="font-size: ' + fontSize[i] + ';">' + fontSize[i] + '</span>';
            menu.add(html, new Function('KE.plugin["' + cmd + '"].exec("' + id + '", "' + i + '")'));
        }
        menu.show();
    },
    exec : function(id, value) {
        KE.util.select(id);
        KE.g[id].iframeDoc.execCommand('fontsize', false, value.substr(0, 1));
        KE.layout.hide(id);
        KE.util.focus(id);
    }
};
KE.plugin['hr'] = {
    click : function(id) {
        var items = [
            '<hr />',
            '<hr size="1">',
            '<hr size="1" color="#000000" />',
            '<hr size="2" color="#000000" />',
            '<hr size="3" color="#000000" />',
            '<hr size="4" color="#000000" />',
            '<hr size="5" color="#000000" />',
            '<hr size="6" color="#000000" />'
        ];
        var cmd = 'hr';
        KE.util.selection(id);
        var menu = new KE.menu({
            id : id,
            cmd : cmd,
            width : '150px'
        });
        for (var i in items) {
            menu.add(items[i], new Function('KE.plugin["' + cmd + '"].exec("' + id + '", \'' + items[i] + '\')'));
        }
        menu.show();
    },
    exec : function(id, value) {
        KE.util.select(id);
        KE.util.insertHtml(id, value);
        KE.layout.hide(id);
        KE.util.focus(id);
    }
};
KE.plugin['preview'] = {
    click : function(id) {
        var dialog = new KE.dialog({
            id : id,
            cmd : 'preview',
            html : KE.util.getData(id),
            width : 600,
            height : 400,
            useFrameCSS : true,
            title : KE.lang['preview'],
            noButton : KE.lang['close']
        });
        dialog.show();
    }
};
KE.plugin['print'] = {
    click : function(id) {
        KE.util.selection(id);
        KE.g[id].iframeWin.print();
    }
};
KE.plugin['source'] = {
    click : function(id) {
        var obj = KE.g[id];
        if (obj.wyswygMode) {
            KE.layout.hide(id);
            obj.newTextarea.value = obj.iframeDoc.body.innerHTML;
            obj.iframe.style.display = 'none';
            obj.newTextarea.style.display = 'block';
            KE.toolbar.disable(id, ['source', 'preview', 'fullscreen']);
            obj.wyswygMode = false;
        } else {
            obj.iframeDoc.body.innerHTML = obj.newTextarea.value;
            obj.iframe.style.display = 'block';
            obj.newTextarea.style.display = 'none';
            KE.toolbar.able(id, ['source', 'preview', 'fullscreen']);
            obj.wyswygMode = true;
        }
        KE.util.focus(id);
    }
};
KE.plugin['textcolor'] = {
    click : function(id) {
        KE.util.selection(id);
        var menu = new KE.menu({
            id : id,
            cmd : 'textcolor'
        });
        menu.picker();
    },
    exec : function(id, value) {
        KE.util.select(id);
        KE.g[id].iframeDoc.execCommand('forecolor', false, value);
        KE.layout.hide(id);
        KE.util.focus(id);
    }
};
KE.plugin['time'] = {
    click : function(id) {
        var date = new Date();
        var hour = date.getHours().toString(10);
        hour = hour.length < 2 ? '0' + hour : hour;
        var minute = date.getMinutes().toString(10);
        minute = minute.length < 2 ? '0' + minute : minute;
        var second = date.getSeconds().toString(10);
        second = second.length < 2 ? '0' + second : second;
        var value = hour + ':' + minute + ':' + second;
        KE.util.selection(id);
        KE.util.insertHtml(id, value);
    }
};
KE.plugin['title'] = {
    click : function(id) {
        var title = KE.lang['titleTable'];
        var cmd = 'title';
        KE.util.selection(id);
        var menu = new KE.menu({
            id : id,
            cmd : cmd,
            width : '120px'
        });
        for (var i in title) {
            var html = '<' + i + ' style="margin:0px;">' + title[i] + '</' + i + '>';
            menu.add(html, new Function('KE.plugin["' + cmd + '"].exec("' + id + '", "<' + i + '>")'));
        }
        menu.show();
    },
    exec : function(id, value) {
        KE.util.select(id);
        KE.g[id].iframeDoc.execCommand('formatblock', false, value);
        KE.layout.hide(id);
        KE.util.focus(id);
    }
};
KE.plugin['emoticons'] = {
    icon : 'emoticons.gif',
    click : function(id) {
        var emoticonTable = [
            ['etc_01.gif','etc_02.gif','etc_03.gif','etc_04.gif','etc_05.gif','etc_06.gif'],
            ['etc_07.gif','etc_08.gif','etc_09.gif','etc_10.gif','etc_11.gif','etc_12.gif'],
            ['etc_13.gif','etc_14.gif','etc_15.gif','etc_16.gif','etc_17.gif','etc_18.gif'],
            ['etc_19.gif','etc_20.gif','etc_21.gif','etc_22.gif','etc_23.gif','etc_24.gif'],
            ['etc_25.gif','etc_26.gif','etc_27.gif','etc_28.gif','etc_29.gif','etc_30.gif'],
            ['etc_31.gif','etc_32.gif','etc_33.gif','etc_34.gif','etc_35.gif','etc_36.gif']
        ];
        var cmd = 'emoticons';
        KE.util.selection(id);
        var table = KE.$$('table');
        table.cellPadding = 0;
        table.cellSpacing = 2;
        table.border = 0;
        for (var i = 0; i < emoticonTable.length; i++) {
            var row = table.insertRow(i);
            for (var j = 0; j < emoticonTable[i].length; j++) {
                var cell = row.insertCell(j);
                cell.style.padding = '1px';
                cell.style.border = '1px solid #F0F0EE';
                cell.style.cursor = 'pointer';
                cell.onmouseover = function() {this.style.borderColor = '#000000'; }
                cell.onmouseout = function() {this.style.borderColor = '#F0F0EE'; }
                cell.onclick = new Function('KE.plugin["' + cmd + '"].exec("' + id + '", "' + emoticonTable[i][j] + '")');
                var img = KE.$$('img');
                img.src = KE.g[id].pluginsPath + 'emoticons/' + emoticonTable[i][j];
                cell.appendChild(img);
            }
        }
        var menu = new KE.menu({
            id : id,
            cmd : cmd
        });
        menu.append(table);
        menu.show();
    },
    exec : function(id, value) {
        KE.util.select(id);
        var html = '<img src="' + KE.g[id].pluginsPath + 'emoticons/' + value + '" border="0">';
        KE.util.insertHtml(id, html);
        KE.layout.hide(id);
        KE.util.focus(id);
    }
};
KE.plugin['flash'] = {
    click : function(id) {
        KE.util.selection(id);
        var dialog = new KE.dialog({
            id : id,
            cmd : 'flash',
            width : 280,
            height : 250,
            title : "Flash",
            previewButton : KE.lang['preview'],
            yesButton : KE.lang['yes'],
            noButton : KE.lang['no']
        });
        dialog.show();
    },
    check : function(id, url) {
        if (url.match(/^\w+:\/\/.{3,}(swf)$/i) == null) {
            alert(KE.lang['invalidSwf']);
            window.focus();
            KE.g[id].yesButton.focus();
            return false;
        }
        return true;
    },
    preview : function(id) {
        var divWidth = 280;
        var divHeight = 180;
        var iframeDoc = KE.g[id].iframeDoc;
        var dialogDoc = KE.util.getIframeDoc(KE.g[id].dialog);
        var url = KE.$('url', dialogDoc).value;
        if (!this.check(id, url)) return false;
        var embed = KE.$$('embed', dialogDoc);
        embed.src = url;
        embed.type = "application/x-shockwave-flash";
        embed.quality = "high";
        embed.width = 190;
        embed.height = 190;
        KE.$('previewDiv', dialogDoc).innerHTML = "";
        KE.$('previewDiv', dialogDoc).appendChild(embed);
    },
    exec : function(id) {
        KE.util.select(id);
        var iframeDoc = KE.g[id].iframeDoc;
        var dialogDoc = KE.util.getIframeDoc(KE.g[id].dialog);
        var url = KE.$('url', dialogDoc).value;
        if (!this.check(id, url)) return false;
        var html = '<embed src="' + url + '" type="application/x-shockwave-flash" quality="high"></embed>';
        KE.util.insertHtml(id, html);
        KE.layout.hide(id);
        KE.util.focus(id);
    }
};
KE.plugin['image'] = {
    click : function(id) {
        KE.util.selection(id);
        var dialog = new KE.dialog({
            id : id,
            cmd : 'image',
            width : 310,
            height : 90,
            title : KE.lang['image'],
            yesButton : KE.lang['yes'],
            noButton : KE.lang['no']
        });
        dialog.show();
    },
    check : function(id) {
        var dialogDoc = KE.util.getIframeDoc(KE.g[id].dialog);
        var type = KE.$('type', dialogDoc).value;
        var url = '';
        if (type == 1) {
            url = KE.$('imgFile', dialogDoc).value;
        } else {
            url = KE.$('url', dialogDoc).value;
        }
        var title = KE.$('imgTitle', dialogDoc).value;
        var width = KE.$('imgWidth', dialogDoc).value;
        var height = KE.$('imgHeight', dialogDoc).value;
        var border = KE.$('imgBorder', dialogDoc).value;
        if (url.match(/\.(jpg|jpeg|gif|bmp|png)$/i) == null) {
            alert(KE.lang['invalidImg']);
            window.focus();
            KE.g[id].yesButton.focus();
            return false;
        }
        if (width.match(/^\d+$/) == null) {
            alert(KE.lang['invalidWidth']);
            window.focus();
            KE.g[id].yesButton.focus();
            return false;
        }
        if (height.match(/^\d+$/) == null) {
            alert(KE.lang['invalidHeight']);
            window.focus();
            KE.g[id].yesButton.focus();
            return false;
        }
        if (border.match(/^\d+$/) == null) {
            alert(KE.lang['invalidBorder']);
            window.focus();
            KE.g[id].yesButton.focus();
            return false;
        }
        return true;
    },
    exec : function(id) {
        KE.util.select(id);
        var iframeDoc = KE.g[id].iframeDoc;
        var dialogDoc = KE.util.getIframeDoc(KE.g[id].dialog);
        var type = KE.$('type', dialogDoc).value;
        if (!this.check(id)) return false;
        if (type == 1) {
            KE.$('editorId', dialogDoc).value = id;
            dialogDoc.uploadForm.submit();
            return false;
        } else {
            var url = KE.$('url', dialogDoc).value;
            var title = KE.$('imgTitle', dialogDoc).value;
            var width = KE.$('imgWidth', dialogDoc).value;
            var height = KE.$('imgHeight', dialogDoc).value;
            var border = KE.$('imgBorder', dialogDoc).value;
            this.insert(id, url, title, width, height, border);
        }
    },
    insert : function(id, url, title, width, height, border) {
        var html = '<img src="' + url + '" ';
        if (width > 0) html += 'width="' + width + '" ';
        if (height > 0) html += 'height="' + height + '" ';
        if (title) html += 'title="' + title + '" ';
        html += 'alt="' + title + '" ';
        html += 'border="' + border + '" />';
        KE.util.insertHtml(id, html);
        KE.layout.hide(id);
        KE.util.focus(id);
    }
};
KE.plugin['layer'] = {
    click : function(id) {
        var cmd = 'layer';
        var styles = [
            'margin:5px;border:1px solid #000000;',
            'margin:5px;border:2px solid #000000;',
            'margin:5px;border:1px dashed #000000;',
            'margin:5px;border:2px dashed #000000;',
            'margin:5px;border:1px dotted #000000;',
            'margin:5px;border:2px dotted #000000;'
        ];
        KE.util.selection(id);
        var menu = new KE.menu({
            id : id,
            cmd : cmd,
            width : '150px'
        });
        for (var i in styles) {
            var html = '<div style="height:15px;' + styles[i] + '"></div>';
            menu.add(html, new Function('KE.plugin["' + cmd + '"].exec("' + id + '", "padding:5px;' + styles[i] + '")'));
        }
        menu.show();
    },
    exec : function(id, value) {
        KE.util.select(id);
        var html = '<div style="' + value + '">' + KE.lang['pleaseInput'] + '</div>';
        KE.util.insertHtml(id, html);
        KE.layout.hide(id);
        KE.util.focus(id);
    }
};
KE.plugin['link'] = {
    click : function(id) {
        KE.util.selection(id);
        var dialog = new KE.dialog({
            id : id,
            cmd : 'link',
            width : 310,
            height : 70,
            title : KE.lang['link'],
            yesButton : KE.lang['yes'],
            noButton : KE.lang['no']
        });
        dialog.show();
    },
    exec : function(id) {
        KE.util.select(id);
        var iframeDoc = KE.g[id].iframeDoc;
        var dialogDoc = KE.util.getIframeDoc(KE.g[id].dialog);
        var url = KE.$('hyperLink', dialogDoc).value;
        var target = KE.$('linkType', dialogDoc).value;
        if (url.match(/\w+:\/\/.{3,}/) == null) {
            alert('URL不正确。');
            window.focus();
            KE.g[id].yesButton.focus();
            return false;
        }
        var element;
        if (KE.browser == 'IE') {
            if (KE.g[id].selection.type.toLowerCase() == 'control') {
                var el = KE.$$("a", iframeDoc);
                el.href = url;
                if (target) el.target = target;
                KE.g[id].range.item(0).applyElement(el);
            } else if (KE.g[id].selection.type.toLowerCase() == 'text') {
                iframeDoc.execCommand("createlink", false, url);
                var el = KE.g[id].range.parentElement();
                if (el && target) el.target = target;
            }
        } else {
            iframeDoc.execCommand("createlink", false, url);
            var el = KE.g[id].range.startContainer.previousSibling;
            if (el && target) el.target = target;
        }
        KE.layout.hide(id);
        KE.util.focus(id);
    }
};
KE.plugin['media'] = {
    click : function(id) {
        KE.util.selection(id);
        var dialog = new KE.dialog({
            id : id,
            cmd : 'media',
            width : 280,
            height : 250,
            title : KE.lang['media'],
            previewButton : KE.lang['preview'],
            yesButton : KE.lang['yes'],
            noButton : KE.lang['no']
        });
        dialog.show();
    },
    check : function(id, url) {
        if (url.match(/^\w+:\/\/.{3,}\.(mp3|wav|wma|wmv|mid|avi|mpg|mpeg|asf|rm|rmvb)$/i) == null) {
            alert(KE.lang['invalidMedia']);
            window.focus();
            KE.g[id].yesButton.focus();
            return false;
        }
        return true;
    },
    preview : function(id) {
        var iframeDoc = KE.g[id].iframeDoc;
        var dialogDoc = KE.util.getIframeDoc(KE.g[id].dialog);
        var url = KE.$('url', dialogDoc).value;
        if (!this.check(id, url)) return false;
        var embed = KE.$$('embed', dialogDoc);
        embed.src = url;
        if (url.match(/\.(rm|rmvb)$/i) == null) {
            embed.type = "video/x-ms-asf-plugin";
        } else {
            embed.type = "audio/x-pn-realaudio-plugin";
        }
        embed.loop = "true";
        embed.autostart = "true";
        embed.width = 260;
        embed.height = 190;
        KE.$('previewDiv', dialogDoc).innerHTML = "";
        KE.$('previewDiv', dialogDoc).appendChild(embed);
    },
    exec : function(id) {
        KE.util.select(id);
        var iframeDoc = KE.g[id].iframeDoc;
        var dialogDoc = KE.util.getIframeDoc(KE.g[id].dialog);
        var url = KE.$('url', dialogDoc).value;
        if (!this.check(id, url)) return false;
        var html;
        if (url.match(/\.(rm|rmvb)$/i) == null) {
            html = '<embed src="' + url + '" type="video/x-ms-asf-plugin" loop="true" autostart="true"></embed>';
        } else {
            html = '<embed src="' + url + '" type="audio/x-pn-realaudio-plugin" loop="true" autostart="true"></embed>';
        }
        KE.util.insertHtml(id, html);
        KE.layout.hide(id);
        KE.util.focus(id);
    }
};
KE.plugin['specialchar'] = {
    click : function(id) {
        var charTable = KE.lang['charTable'];
        var cmd = 'specialchar';
        KE.util.selection(id);
        var table = KE.$$('table');
        table.cellPadding = 0;
        table.cellSpacing = 2;
        table.border = 0;
        for (var i = 0; i < charTable.length; i++) {
            var row = table.insertRow(i);
            for (var j = 0; j < charTable[i].length; j++) {
                var cell = row.insertCell(j);
                cell.style.padding = '1px';
                cell.style.border = '1px solid #AAAAAA';
                cell.style.fontSize = '12px';
                cell.style.cursor = 'pointer';
                cell.onmouseover = function() {this.style.borderColor = '#000000'; }
                cell.onmouseout = function() {this.style.borderColor = '#AAAAAA'; }
                cell.onclick = new Function('KE.plugin["' + cmd + '"].exec("' + id + '", "' + charTable[i][j] + '")');
                cell.innerHTML = charTable[i][j];
            }
        }
        var menu = new KE.menu({
            id : id,
            cmd : cmd
        });
        menu.append(table);
        menu.show();
    },
    exec : function(id, value) {
        KE.util.select(id);
        KE.util.insertHtml(id, value);
        KE.layout.hide(id);
        KE.util.focus(id);
    }
};
KE.plugin['table'] = {
    selected : function(id, i, j) {
        var text = i.toString(10) + ' by ' + j.toString(10) + ' Table';
        KE.$('tableLocation' + id).innerHTML = text;
        var num = 10;
        for (var m = 1; m <= num; m++) {
            for (var n = 1; n <= num; n++) {
                var td = KE.$('tableTd' + id + m.toString(10) + '_' + n.toString(10) + '');
                if (m <= i && n <= j) {
                    td.style.backgroundColor = '#CCCCCC';
                } else {
                    td.style.backgroundColor = '#FFFFFF';
                }
            }
        }
    },
    click : function(id) {
        var cmd = 'table';
        KE.util.selection(id);
        var num = 10;
        var html = '<table cellpadding="0" cellspacing="0" border="0" style="width:130px;">';
        for (i = 1; i <= num; i++) {
            html += '<tr>';
            for (j = 1; j <= num; j++) {
                var value = i.toString(10) + ',' + j.toString(10);
                html += '<td id="tableTd' + id + i.toString(10) + '_' + j.toString(10) +
                    '" style="font-size:1px;width:12px;height:12px;background-color:#FFFFFF;' +
                    'border:1px solid #DDDDDD;cursor:pointer;" ' +
                    'onclick="javascript:KE.plugin[\'table\'].exec(\'' + id + '\', \'' + value + '\');" ' +
                    'onmouseover="javascript:KE.plugin[\'table\'].selected(\'' + id + '\', \'' + i.toString(10) +
                    '\', \'' + j.toString(10) + '\');">&nbsp;</td>';
            }
            html += '</tr>';
        }
        html += '<tr><td colspan="10" id="tableLocation' + id +
            '" style="font-size:12px;text-align:center;height:20px;"></td></tr>';
        html += '</table>';
        var menu = new KE.menu({
            id : id,
            cmd : cmd
        });
        menu.insert(html);
        menu.show();
    },
    exec : function(id, value) {
        KE.util.select(id);
        var location = value.split(',');
        var html = '<table border="1">';
        for (var i = 0; i < location[0]; i++) {
            html += '<tr>';
            for (var j = 0; j < location[1]; j++) {
                html += '<td>&nbsp;</td>';
            }
            html += '</tr>';
        }
        html += '</table>';
        KE.util.insertHtml(id, html);
        KE.layout.hide(id);
        KE.util.focus(id);
    }
};