<script>
  import Fa from 'svelte-fa'
  import { onMount } from 'svelte'
  import { faGithub } from '@fortawesome/free-brands-svg-icons'
  import Clipboard from 'clipboard'


  let copiedGroup = false
  let groupName = '~raldeg/nativeplanet'

  let copyGroupLink 
    
  onMount(()=> {
    copyGroupLink = new Clipboard('#group')
    copyGroupLink.on("success", ()=> {
    copiedGroup = true; setTimeout(()=> copiedGroup = false, 1000)})
  })

</script>
<div class="contact">
  <div class="contact-title">Support</div>
  <a href='https://nativeplanet.io' target='_blank' class="site">
    <img src='/nplogo.svg' style="width:20px" alt='Native Planet Logo' />
  </a>
  <a href='https://github.com/Native-Planet' target='_blank' class="site">
    <Fa icon={faGithub} size="1x" />
  </a>
  <div id='group' class="group" data-clipboard-text={groupName} >{copiedGroup ? "copied!" : groupName}</div>
</div>

<style>
  a { color: inherit; }
  .contact {
    display: flex;
    background: #0000001d;
    padding: 0px 30px;
    height: 50px;
    border-radius: 8px;
    font-size: 18px;
    gap: 16px;
    align-items: center;
  }
  .contact-title {
    font-size: 16px;
    flex: 1;
  }
  .group {
    font-size: 12px;
    font-family: inherit;
    width: 122px;
    text-align: center;
    margin-top: 3px;
    cursor: pointer;
  }
  .site {
    margin-top: 4px;
    padding: 0;
  }
</style>
