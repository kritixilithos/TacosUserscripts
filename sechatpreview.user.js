// ==UserScript==
// @name         Chat Preview
// @namespace    http://tampermonkey.net/
// @version      0.1.10
// @description  Preivew SE chat before posting!
// @author       The Flamin' Taco
// @include *://chat.meta.stackoverflow.com/rooms/*
// @include *://chat.meta.stackexchange.com/rooms/*
// @include *://chat.stackexchange.com/rooms/*
// @include *://chat.stackoverflow.com/rooms/*
// @include *://chat.askubuntu.com/rooms/*
// @include *://chat.serverfault.com/rooms/*
// @run-at document-end
// @grant        none
// ==/UserScript==

/* global $, markdownMini */
(function() {
    'use strict';

    var taco = window.taco = window.taco || {
        installedScripts: []
    };
    taco.installedScripts.push("chatPreview");
    var chatPreview = taco.chatPreview = {};

    chatPreview.markdownTaco = function(chat_prev, s) {
        var wrap_left = "";
        var wrap_right = "";

        if (taco.installedScripts.find(x => x === "caretReply")) {
            var replyTo = taco.caretReply.getMessage(s);
            if (replyTo) {
                var msgId = replyTo.getAttribute("id").replace(/message-/, "");
                replyTo = $("#message-"+msgId);
                var usr_name = replyTo.parent().parent().find(".tiny-signature").find(".username").text();
                wrap_left = `<b>${usr_name}</b><br><b style='color:gray;'>${replyTo.find(".content").text()}</b><br><br>`;
                s = taco.caretReply.getMessageText(s);
                if (s === "*") {
                    s = "";
                    wrap_right = "<span class='stars vote-count-container'><span class='img vote'></span><span class='times'>±1</span></span>";
                }
                if(taco.caretReply.sedMatch){
                    var match = taco.caretReply.sedMatch(s);
                    if(match){
                        $.get("/message/" + msgId + "?plain=true", function(e) {
                            wrap_right += "<span style='font-size:20px;'>&#x270D;</span>";
                            chat_prev.innerHTML = wrap_left + e.replace(new RegExp(match[0], match[2]), match[1]) + wrap_right;
                        });
                        return;
                    }
                }
            }
        }
        if (s.match(/(gif|png|jpg|jpeg|bmp|svg)$/i)) {
            return "<img src=" + s + " />";
        }
        chat_prev.innerHTML = wrap_left + markdownMini(s) + wrap_right;
    };

    $("#main").append('<div id="chat-preview" style="position:fixed;bottom:95px;margin-bottom:12px;border:solid;border-radius:4px;background:white;padding:4px;display:none"></div>');
    var stored = "";
    var timer = -1;
    setInterval(function() {
        var S = document.getElementById("input").value;
        var chat_prev = document.getElementById("chat-preview");
        if (S !== null && stored != S) {
            $(chat_prev).css({
                display: S.length === 0 ? 'none' : ''
            });
            if (timer !== -1)
                clearTimeout(timer);
            document.getElementById("chat-preview").innerHTML = "<b style='color:gray'>...</b>";
            stored = S;
            timer = setTimeout(function() {
                timer = -1;
                chatPreview.markdownTaco(chat_prev, S);
            }, 500);
        }
    }, 30);
})();
