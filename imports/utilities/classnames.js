export default function classnames() {
  return Array.prototype.map.call(arguments, arg => {
    if (typeof arg === 'string') {
      return arg;
    } else if (Array.isArray(arg)) {
      return arg.join(' ');
    } else {
      return Object.keys(arg).filter(x => arg[x]).join(' ');
    }
  }).join(' ');
}
