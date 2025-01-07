// This function returns a random image URL
const getRandomImage = () => {
    const images = [
      '/RenderImg1.png',
      '/RenderImg2.png',
      '/RenderImg3.png',
      '/RenderImg4.png',
      '/RenderImg5.png',
      '/RenderImg6.png',
      '/RenderImg7.png',
      '/RenderImg8.png',
      '/RenderImg9.png',
    ];
  
    const randomIndex = Math.floor(Math.random() * images.length);
    return images[randomIndex];
  };
export default getRandomImage;