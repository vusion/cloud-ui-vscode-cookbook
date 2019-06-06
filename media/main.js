(function () {
    // const vscode = acquireVsCodeApi();

    const iframe = document.createElement('iframe');
    iframe.width = window.innerWidth + 245;
    iframe.style['margin-left'] = '-240px';
    iframe.height = window.innerHeight;
    iframe.src = window.vusionSource;
    document.body.appendChild(iframe)
}());