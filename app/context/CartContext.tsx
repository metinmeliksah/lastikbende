const fetchCartItems = async () => {
  if (!user) return;
  console.log('Fetching cart items for user:', user.id);
  try {
    const { data: cartItems, error } = await supabase
      .from('sepet')
      .select(`
        *,
        stok:stok_id(
          *,
          urundetay:urun_id(*),
          sellers:magaza_id(*)
        )
      `)
      .eq('kullanici_id', user.id);
  } catch (error) {
    console.error('Error fetching cart items:', error);
  }
}; 