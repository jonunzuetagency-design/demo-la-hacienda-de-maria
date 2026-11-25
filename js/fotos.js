/* Fotos reales de La Hacienda de María y de su entorno en Liébana */
window.FOTOS = [
  ['h041', 'casa', 'La hacienda desde el jardín'],
  ['h053', 'casa', 'Jardín y tejados de la hacienda'],
  ['h000', 'casa', 'La hacienda y la piscina desde lo alto'],
  ['h038.jpg', 'casa', 'Corredores y balcones de madera'],
  ['h059', 'casa', 'Balcón de piedra con geranios'],
  ['h039', 'casa', 'El patio empedrado'],
  ['h029', 'casa', 'Porche entre flores'],
  ['h030', 'casa', 'Balcón de madera'],
  ['h060', 'casa', 'Ventana entre la hiedra'],
  ['h021', 'casa', 'Piedra, madera y aperos'],
  ['h002', 'aptos', 'Salón de un apartamento'],
  ['h020', 'aptos', 'Salón amplio bajo vigas de madera'],
  ['h010', 'aptos', 'Dormitorio abuhardillado'],
  ['h012', 'aptos', 'Dormitorio doble'],
  ['h004.jpg', 'aptos', 'Comedor y cocina americana'],
  ['h001.jpg', 'aptos', 'Ventanal a la montaña'],
  ['h032', 'spa', 'La piscina'],
  ['h040.jpg', 'spa', 'Piscina entre los apartamentos'],
  ['h024', 'spa', 'Sauna'],
  ['h025', 'spa', 'Jacuzzi'],
  ['h027.jpg', 'spa', 'Zona de spa'],
  ['h015', 'vida', 'Salón social'],
  ['h018', 'vida', 'Salón social'],
  ['h022', 'vida', 'La biblioteca'],
  ['h031', 'vida', 'Mesas de piedra en el jardín'],
  ['h058', 'vida', 'Barbacoa de piedra'],
  ['h042.jpg', 'vida', 'Porche sobre el jardín'],
  ['h034', 'liebana', 'Potes, con los Picos de Europa al fondo'],
  ['h035', 'liebana', 'Monasterio de Santo Toribio de Liébana'],
  ['h048.jpg', 'liebana', 'Santa María de Lebeña'],
  ['h047.jpg', 'liebana', 'Mogrovejo'],
  ['h051.jpg', 'liebana', 'Torre del Infantado, Potes'],
  ['h033', 'liebana', 'Románico lebaniego'],
  ['h052', 'liebana', 'Mar de nubes sobre los valles'],
  ['h078', 'liebana', 'Picos de Europa'],
  ['h079', 'liebana', 'Teleférico de Fuente Dé'],
  ['h043.jpg', 'liebana', 'Los Picos desde Liébana'],
  ['h037.jpg', 'liebana', 'San Vicente de la Barquera']
].map(function (f) {
  var jpg = /\.jpg$/.test(f[0]);
  var id = f[0].replace('.jpg', '');
  return {
    id: id, cat: f[1], alt: f[2],
    full: 'img/' + (jpg ? id + '.jpg' : id + '.webp'),
    thumb: 'img/' + (jpg ? id + '.jpg' : id + '-t.webp')
  };
});
window.CATS = { casa: 'La casa', aptos: 'Apartamentos', spa: 'Spa y piscina', vida: 'Vida en la hacienda', liebana: 'Liébana' };
