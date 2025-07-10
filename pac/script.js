document.addEventListener('DOMContentLoaded', function () {
    const pacContent = document.getElementById('pacContent');
    const domainsList = document.getElementById('domainsList');
    const newDomain = document.getElementById('newDomain');
    const addDomain = document.getElementById('addDomain');
    const proxyInput = document.getElementById('proxyInput');
    const updateProxy = document.getElementById('updateProxy');
    const openFile = document.getElementById('openFile');
    const saveFile = document.getElementById('saveFile');

    let domains = [];
    let proxy = '';

    openFile.addEventListener('click', function () {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.pac';
        input.onchange = function (e) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = function (event) {
                pacContent.value = event.target.result;
                parsePACContent(event.target.result);
            };
            reader.readAsText(file);
        };
        input.click();
    });

    saveFile.addEventListener('click', function () {
        const content = generatePACContent();
        const blob = new Blob([content], {type: 'text/plain'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'edited.pac';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });

    addDomain.addEventListener('click', function () {
        const domain = newDomain.value.trim();
        if (domain) {
            domains.push(domain);
            updateDomainsList();
            newDomain.value = '';
        }
    });

    updateProxy.addEventListener('click', function () {
        proxy = proxyInput.value.trim();
    });

    function parsePACContent(content) {
        const domainsMatch = content.match(/const domains = \[([^\]]+)\]/);
        if (domainsMatch) {
            domains = domainsMatch[1].split(',').map(domain => domain.trim().replace(/["']/g, ''));
            updateDomainsList();
        }

        const proxyMatch = content.match(/const proxy = "([^"]+)"/);
        if (proxyMatch) {
            proxy = proxyMatch[1];
            proxyInput.value = proxy;
        }
    }

    function updateDomainsList() {
        domainsList.innerHTML = '';
        domains.forEach((domain, index) => {
            const li = document.createElement('li');
            li.innerHTML = `
                ${domain}
                <button class="deleteDomain" data-index="${index}">Delete</button>
            `;
            domainsList.appendChild(li);
        });

        document.querySelectorAll('.deleteDomain').forEach(button => {
            button.addEventListener('click', function () {
                const index = this.getAttribute('data-index');
                domains.splice(index, 1);
                updateDomainsList();
            });
        });
    }

    function generatePACContent() {
        return `const domains = [${domains.map(domain => `"${domain}"`).join(', ')}];
const proxy = "${proxy}";
const direct = "DIRECT;";

const domainObject = {};
domains.filter(Boolean).forEach((domain) => {
  domainObject[domain] = 1;
});

function FindProxyForURL(url, host) {
  let suffix;
  let pos = host.lastIndexOf(".");
  pos = host.lastIndexOf(".", pos - 1);
  while (1) {
    if (pos <= 0) {
      if (Object.hasOwnProperty.call(domainObject, host)) {
        return proxy;
      } else {
        return direct;
      }
    }
    suffix = host.substring(pos + 1);
    if (Object.hasOwnProperty.call(domainObject, suffix)) {
      return proxy;
    }
    pos = host.lastIndexOf(".", pos - 1);
  }
}`;
    }
});
