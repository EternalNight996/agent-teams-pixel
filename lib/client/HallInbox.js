import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import css from './SectHallOverlay.module.css';
export function HallInbox({ messages, t }) {
    if (messages.length === 0) {
        return _jsx("p", { className: css.settingsHint, children: t('workspace.inboxEmpty') });
    }
    return (_jsx("ul", { className: css.inboxList, tabIndex: 0, "aria-label": t('workspace.inbox'), children: messages.map((message, index) => (_jsxs("li", { className: css.inboxRow, children: [_jsx("span", { className: css.inboxFrom, children: message.from }), _jsx("span", { className: css.inboxText, children: message.content })] }, `${index}:${message.from}`))) }));
}
