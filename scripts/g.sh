#!/bin/bash

dir="$1"
out="$2"
pass="$3"

count=0
toolsDir=$(dirname $0)
mkdir -p "${out}/t"
mkdir -p "${out}/l"
indexFile="${out}/index"
enc="${toolsDir}/menc"

find "${dir}" -maxdepth 1 -type f -iname "*.jpg" | sort | while read filePath; do
	count=$((count+1))
	fileName=$(basename "${filePath}")
	"${enc}" "${filePath}" "${out}/l/${count}.txt" "${pass}"
	convert -resize 200x200 "${filePath}" "${out}/t/${fileName}"
	"${enc}" "${out}/t/${fileName}" "${out}/t/${count}.txt" "${pass}"
	rm "${out}/t/${fileName}"
	echo -e "<img class='cjsenc' data-large='l/${count}.txt' data-src='t/${count}.txt' data-name='${count}'>\n" >> "${indexFile}"
done

"${enc}" "${indexFile}" "${indexFile}.txt" "${pass}"
rm "${indexFile}"	