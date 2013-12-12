require 'pp'
require 'json'
require 'rubygems'
require 'pry'

object_ids = [4324,2078,63689,1850,1218,72222,111388,376,1819,109582,1978,30567,111576,11904,108860,1629,6783,1854,5178,2606,6176]

h = Dir.glob('*/*.mp3')
  .map {|path| path.split('/')}
  .group_by{|dir, file| dir}
  .inject({}) do |hash, (group, files)|
    hash[group] = {
      id: object_ids.shift,
      tracks: files.map {|file|
        {file: file.last,
        title: file.last.gsub('_', ' ').gsub(/.mp3/, '').split(' ').last(2).join(' ')}
      }
    }
    hash
  end

puts JSON.generate(h)
