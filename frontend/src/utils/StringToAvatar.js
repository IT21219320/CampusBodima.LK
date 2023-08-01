const StringToColor = (string) => {
    let hash = 0;
    let i;
  
    /* eslint-disable no-bitwise */
    for (i = 0; i < string.length; i += 1) {
      hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }
  
    let color = '#';
  
    for (i = 0; i < 3; i += 1) {
      const value = (hash >> (i * 8)) & 0xff;
      color += `00${value.toString(16)}`.slice(-2);
    }
    /* eslint-enable no-bitwise */
    
    return color;
}

const StringToAvatar = (name) => {
  let letters = '';
  if(name.split(' ').length > 1){
    letters = name.split(' ')[0].charAt(0).toUpperCase()+name.split(' ')[1].charAt(0).toUpperCase();
  }
  else{
    letters = name.split(' ')[0].charAt(0).toUpperCase();
  }

  return {
    sx: {
      bgcolor: StringToColor(name),
    },
    children: letters,
  };

}

export { StringToAvatar };