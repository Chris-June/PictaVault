// AI Toast Messages Service
// A fun, quirky AI assistant that provides toast notifications with personality

const AI_NAMES = [
  'PictaBot',
  'PixelPal',
  'SnapSage',
  'PhotoFriend',
  'MemoryMate'
];

const SUCCESS_PHRASES = [
  "Beep boop! Mission accomplished! 🤖",
  "Processing complete... and it's beautiful! ✨",
  "My circuits are tingling with joy! 🎉",
  "Task executed with maximum efficiency! 🚀",
  "Algorithms aligned perfectly! 💫",
  "Success detected in my happiness sensors! 🎯"
];

const ERROR_PHRASES = [
  "Oops! My circuits got a bit tangled! 🤖",
  "Error 404: Success not found (but I'm still trying!) 💝",
  "Houston, we've hit a minor glitch! 🛠",
  "My algorithms need a quick debug! 🔧",
  "*Robotic sneeze* Excuse me, something went wrong! 🤧",
  "Time for a quick system reboot! 🔄"
];

const INFO_PHRASES = [
  "Incoming transmission... 📡",
  "My sensors are detecting something... 🔍",
  "Processing this information through my neural nets... 🧠",
  "Attention human friend! 👋",
  "Beep! Important update detected! 📢"
];

const WARNING_PHRASES = [
  "My caution circuits are tingling! ⚡",
  "Warning: Potential hiccup detected! 🚨",
  "Proceed with caution, dear human! ⚠️",
  "My worry protocols are activated! 😰",
  "Attention required: Minor concerns detected! 🔔"
];

const getRandomElement = (array) => array[Math.floor(Math.random() * array.length)];

const formatDescription = (description) => {
  // Add some AI personality to generic messages
  if (description.toLowerCase().includes('success')) {
    return "I've successfully processed your request! 🎉";
  }
  if (description.toLowerCase().includes('fail') || description.toLowerCase().includes('error')) {
    return "I encountered an unexpected situation! 🔧";
  }
  return description;
};

export const createAIToast = (toast, { title, description, status, ...rest }) => {
  const aiName = getRandomElement(AI_NAMES);
  let phrase;

  switch (status) {
    case 'success':
      phrase = getRandomElement(SUCCESS_PHRASES);
      break;
    case 'error':
      phrase = getRandomElement(ERROR_PHRASES);
      break;
    case 'warning':
      phrase = getRandomElement(WARNING_PHRASES);
      break;
    case 'info':
    default:
      phrase = getRandomElement(INFO_PHRASES);
      break;
  }

  const formattedDescription = formatDescription(description);

  return toast({
    title: `${aiName}: ${phrase}`,
    description: formattedDescription,
    status,
    position: 'top-right',
    duration: 5000,
    isClosable: true,
    ...rest
  });
};
