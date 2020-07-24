export const removeEmojis = (text) => {
  // https://www.regextester.com/106421
  // the following code removes the following characters
  // 0x00A9(copy right symbol),
  // 0x00AE(register symbol),
  // 0x1F000 - 0x1F3FF, 0x1F400 - 0x1F7FF, 0x1F800 - 0x1FBFF (various emoji, symobols and pictographs)
  return typeof text === 'string'
    ? text
        .replace(
          /(\u00a9|\u00ae|[\u2000-\u2BFF]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/g,
          ''
        )
        .trim()
    : ''
}
