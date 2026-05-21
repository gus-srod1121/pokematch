const pageFolder = "pages";

export default function sendPage(res, pageName) {
    res.sendFile(pageName, { root: pageFolder });
}