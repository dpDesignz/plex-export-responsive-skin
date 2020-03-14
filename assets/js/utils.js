const ready = callback => {
  if (document.readyState !== 'loading') callback();
  else document.addEventListener('DOMContentLoaded', callback);
};

function episode_tag(season, episode) {
  const s = season.index;
  const e = episode.index;
  let r = s < 10 ? `S0${s}` : `S${s}`;
  r += e < 10 ? `E0${e}` : `E${e}`;
  return r;
} // end func: episode_tag

function number_format(numIn) {
  let num = parseInt(numIn);
  if (num < 1000) return num;
  num = num.toString();
  const rgx = /(\d+)(\d{3})/;
  while (rgx.test(num)) {
    num = num.replace(rgx, '$1' + ',' + '$2');
  }
  return num;
} // end func: number_format

function inflect(num, single, plural) {
  if (num === 1) return single;
  if (plural) return plural;
  return `${single}s`;
} // end func: inflect

function hl_bytes_to_human(bytes) {
  const b = parseInt(bytes);
  if (b < 1024) return `${b} b`;
  let kb = b / 1024;
  if (kb < 1024) return `${Math.round(kb * 100) / 100} Kb`;
  const mb = kb / 1024;
  if (mb < 1024) return `${Math.round(mb * 100) / 100} Mb`;
  const gb = mb / 1024;
  if (gb < 1024) return `${Math.round(gb * 100) / 100} Gb`;
  const pb = gb / 1024;
  return `${Math.round(pb * 100) / 100} Pb`;
  if (bytes < 1073741824)
    return `${Math.round((bytes / 1048576) * 100) / 100} Mb`;
  kb = b / 1024;
  if (bytes < 1099511627776)
    return `${Math.round((bytes / 1073741824) * 100) / 100} Gb`;
  return `${bytes} Xb`;
} // end func: hl_bytes_to_human

// FX Function ~ https://codepen.io/gabrieleromanato/pen/frIwl
(function() {
  const FX = {
    easing: {
      linear(progress) {
        return progress;
      },
      quadratic(progress) {
        return Math.pow(progress, 2);
      },
      swing(progress) {
        return 0.5 - Math.cos(progress * Math.PI) / 2;
      },
      circ(progress) {
        return 1 - Math.sin(Math.acos(progress));
      },
      back(progress, x) {
        return Math.pow(progress, 2) * ((x + 1) * progress - x);
      },
      bounce(progress) {
        for (var a = 0, b = 1, result; 1; a += b, b /= 2) {
          if (progress >= (7 - 4 * a) / 11) {
            return (
              -Math.pow((11 - 6 * a - 11 * progress) / 4, 2) + Math.pow(b, 2)
            );
          }
        }
      },
      elastic(progress, x) {
        return (
          Math.pow(2, 10 * (progress - 1)) *
          Math.cos(((20 * Math.PI * x) / 3) * progress)
        );
      },
    },
    animate(options) {
      const start = new Date();
      const id = setInterval(function() {
        const timePassed = new Date() - start;
        let progress = timePassed / options.duration;
        if (progress > options.setTo) {
          progress = options.setTo;
        }
        options.progress = progress;
        const delta = options.delta(progress);
        options.step(delta);
        if (progress === options.setTo) {
          clearInterval(id);
          // Reset styles
          options.element.style.display =
            options.type === 'in' ? 'block' : 'none';
          options.element.style.opacity = null;
          if (options.complete) options.complete();
        }
      }, options.delay || 10);
    },
    fadeOut(element, options = { duration: 400, setTo: 1, complete: null }) {
      const to = 1;
      this.animate({
        type: 'out',
        element,
        duration: options.duration,
        setTo: options.setTo,
        delta(progress) {
          progress = this.progress;
          return FX.easing.swing(progress);
        },
        complete: options.complete,
        step(delta) {
          element.style.opacity = to - delta;
        },
      });
    },
    fadeIn(element, options = { duration: 400, setTo: 1, complete: null }) {
      const to = 0;
      this.animate({
        type: 'in',
        element,
        duration: options.duration,
        setTo: options.setTo,
        delta(progress) {
          progress = this.progress;
          return FX.easing.swing(progress);
        },
        complete: options.complete,
        step(delta) {
          element.style.opacity = to + delta;
        },
      });
    },
  };
  window.FX = FX;
})();
