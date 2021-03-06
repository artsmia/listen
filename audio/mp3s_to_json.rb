require 'pp'
require 'json'
require 'rubygems'
require 'pry'

object_ids = [4324,2078,63689,1850,1218,72222,111388,376,1819,109582,1978,30567,111576,11904,108860,1629,6783,1854,5178,2606,6176]
colors_by_id = {"111576"=>["#c6bdb2","#e5e3d0","#885042","#471818","#a5715c"],"111388"=>["#61615c","#492e22","#807460","#ccc3ae"],"109582"=>["#806f58","#a19272","#c6b798","#63543b","#44392b"],"108860"=>["#7e3419","#b27a52","#372c2a","#5d332a","#a0532c"],"72222"=>["#ab916c","#755f43","#d7bf98","#463725"],"2078"=>["#80010c","#5b4273","#5f1238","#b1a680","#dcc09b"],"1978"=>["#3e3626","#5a7498","#351a08","#605838","#c0b494"],"1854"=>["#332f27","#615647"],"1850"=>["#473a2e","#220d03","#6c5743","#343a2c","#231c0b"],"1819"=>["#432f20","#dbd2ba","#664d3a","#bda084","#456a6e"],"1629"=>["#a8a093","#736c65","#3c3730"],"1218"=>["#c4bb84","#85571e","#a67e27","#827e65","#635b4f"],"376"=>["#808387","#6d695d","#31302a"],"2606"=>["#98070e","#efea75","#221115","#f9d9d6","#5c1719"],"4324"=>["#949887","#b8bdac","#6d705c","#535341","#2a2a20"],"5178"=>["#aab4b8","#738283","#596667","#a89e81","#763a22"],"6176"=>["#8f885d","#c4c3a9","#c0a872","#7d7d85","#6a5237"],"6783"=>["#3b2f9d","#4a4544","#6a6467","#7c798a","#0d0732"],"11904"=>["#ffffff"],"30567"=>["#2b2a29"],"63689"=>["#2c2d32","#5c564f","#877f73"]}

h = Dir.glob('*/*.mp3')
  .map {|path| path.split('/')}
  .group_by{|dir, file| dir}
  .inject({}) do |hash, (group, files)|
    hash[group] = {
      id: (_id = object_ids.shift),
      colors: colors_by_id[_id.to_s],
      tracks: files.map {|file|
        {file: file.last,
        title: file.last.gsub('_', ' ').gsub(/.mp3/, '').split(' ').last(2).join(' ')}
      }
    }
    hash
  end

puts JSON.generate(h)
