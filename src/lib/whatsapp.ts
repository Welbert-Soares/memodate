export async function sendWhatsapp(phone: string, apiKey: string, message: string): Promise<boolean> {
  const url = `https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${encodeURIComponent(message)}&apikey=${apiKey}`
  const res = await fetch(url)
  return res.ok
}
