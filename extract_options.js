const fs = require('fs');
const cheerio = require('cheerio');
const files = fs.readdirSync('.').filter(f => f.endsWith('.mhtml'));

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/=\r?\n/g, '');
  content = content.replace(/=([A-F0-9]{2})/g, (match, p1) => String.fromCharCode(parseInt(p1, 16)));
  
  const htmlStart = content.indexOf('<html');
  const htmlEnd = content.lastIndexOf('</html>') + 7;
  const html = content.slice(htmlStart !== -1 ? htmlStart : 0, htmlEnd !== -1 ? htmlEnd : content.length);
  
  const $ = cheerio.load(html);
  console.log('--- ' + file + ' ---');
  
  let lingkupDiv = null;
  $('div[role="heading"], span.M7eMe').each((i, el) => {
      if ($(el).text().trim().toUpperCase() === 'LINGKUP PEKERJAAN') {
          lingkupDiv = $(el).parent().parent().parent();
      }
  });
  
  if (lingkupDiv && lingkupDiv.length > 0) {
      const options = [];
      lingkupDiv.find('[role="radio"], [role="checkbox"]').each((i, el) => {
          const ariaLabel = $(el).attr('aria-label');
          if (ariaLabel) {
              options.push(ariaLabel);
          } else {
              // try finding the text right next to it
              const val = $(el).attr('data-value');
              if (val) options.push(val);
          }
      });
      // if still empty, find all span texts that look like options
      if (options.length === 0) {
            lingkupDiv.find('span.aDTYNe, span[dir=\"auto\"]').each((i, el) => {
              const text = $(el).text().trim();
              if (text && text.toUpperCase() !== 'LINGKUP PEKERJAAN' && !text.includes('This is a required question') && text.length > 2) {
                  options.push(text);
              }
          });
      }
      
      console.log([...new Set(options)].join('\n'));
  } else {
      console.log('LINGKUP PEKERJAAN section not found via exact match. Trying fuzzy match...');
      $('span').each((i, el) => {
          if ($(el).text().includes('LINGKUP PEKERJAAN')) {
              console.log('Found span containing LINGKUP PEKERJAAN');
              const div = $(el).closest('div[role="listitem"]');
              if (div.length) {
                   const opts = [];
                   div.find('[role="checkbox"]').each((j, cel) => {
                       opts.push($(cel).attr('aria-label') || $(cel).attr('data-value') || 'unknown');
                   });
                   console.log(opts.join('\n'));
              }
          }
      })
  }
}
