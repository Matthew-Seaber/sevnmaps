export function getImageURL(imagePath: string, square: boolean | undefined) {
  if (!imagePath) {
    if (square) {
      return `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/place-images/placeholder-square.png`;
    }
    
    return `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/place-images/placeholder.png`;
  }

  return `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${imagePath}`;
}
