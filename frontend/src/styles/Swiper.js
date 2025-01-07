// Make the user's video draggable
const userVideo = document.querySelector('.userVideo');

userVideo.addEventListener('mousedown', function(e) {
    const offsetX = e.clientX - userVideo.getBoundingClientRect().left;
    const offsetY = e.clientY - userVideo.getBoundingClientRect().top;

    function mouseMoveHandler(e) {
        userVideo.style.left = `${e.clientX - offsetX}px`;
        userVideo.style.top = `${e.clientY - offsetY}px`;
    }

    function mouseUpHandler() {
        document.removeEventListener('mousemove', mouseMoveHandler);
        document.removeEventListener('mouseup', mouseUpHandler);
    }

    document.addEventListener('mousemove', mouseMoveHandler);
    document.addEventListener('mouseup', mouseUpHandler);
});
