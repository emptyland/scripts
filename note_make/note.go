package main

import (
	"bufio"
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"os"
	"os/exec"
	"path/filepath"
	"sort"
	"text/template"
)

// Configure info for generator
type configure struct {
	HomeTitle string   `json:"homeTitle"`
	HomePage  string   `json:"homePage"`
	Title     []string `json:"title"`
	Name      string   `json:"name"`
}

type generator struct {
	conf         *configure
	markDownFile []string
}

const (
	pageTemplateFileName  = "page_template.html"
	indexTemplateFileName = "index_template.html"
	destFileName          = "%02dpage.html"
	indexFileName         = "index.html"
)

func main() {
	file, err := os.Open("conf.json")
	if err != nil {
		fmt.Println(err)
		return
	}
	defer file.Close()

	conf := &configure{}
	decoder := json.NewDecoder(file)
	if err = decoder.Decode(conf); err != nil {
		fmt.Println(err)
		return
	}

	if err = NewGenerator(conf).Run(); err != nil {
		fmt.Println(err)
	}
}

func NewGenerator(conf *configure) *generator {
	return &generator{conf, make([]string, 0)}
}

func (self *generator) Run() error {
	var err error
	if err = self.findAll(); err != nil {
		return err
	}
	if err = self.generateIndex(); err != nil {
		return err
	}
	if err = self.generateAll(); err != nil {
		return err
	}
	return err
}

func (self *generator) findAll() error {
	dir, err := os.Open(".")
	if err != nil {
		return err
	}
	defer dir.Close()

	var names []string
	if names, err = dir.Readdirnames(-1); err != nil {
		return err
	}

	for _, name := range names {
		if filepath.Ext(name) == ".md" {
			self.markDownFile = append(self.markDownFile, name)
		}
	}
	sort.Strings(self.markDownFile)
	return nil
}

type context struct {
	Title     string
	HomeTitle string
	PrevPage  string
	HomePage  string
	NextPage  string
	PrevTitle string
	NextTitle string
	Content   string
}

func (self *generator) generateIndex() error {
	ctx := context{
		Title:     self.conf.Name,
		HomeTitle: self.conf.HomeTitle,
	}
	tmpl := template.Must(template.New("").ParseFiles(indexTemplateFileName))

	var buf bytes.Buffer
	for i, page := range self.conf.Title {
		buf.WriteString(fmt.Sprintf(`<a href="%s">%s</a><br />`,
			fmt.Sprintf(destFileName, i), page))
	}
	ctx.Content = buf.String()

	var err error
	var file *os.File
	file, err = os.Create(indexFileName)
	if err != nil {
		return err
	}
	if err = tmpl.ExecuteTemplate(file, indexTemplateFileName, ctx); err != nil {
		return err
	}
	return nil
}

func (self *generator) generateAll() error {
	ctx := context{HomePage: self.conf.HomePage}
	tmpl := template.Must(template.New("").ParseFiles(pageTemplateFileName))

	for i, mdFileName := range self.markDownFile {
		ctx.Title = self.conf.Title[i]
		ctx.HomeTitle = self.conf.HomeTitle
		var err error
		if err = self.getNearInfo(i, &ctx); err != nil {
			return err
		}
		if ctx.Content, err = self.doMarkDown(mdFileName); err != nil {
			return err
		}

		var file *os.File
		file, err = os.Create(fmt.Sprintf(destFileName, i))
		if err != nil {
			return err
		}
		if err = tmpl.ExecuteTemplate(file, pageTemplateFileName, ctx); err != nil {
			return err
		}
	}
	return nil
}

func (self *generator) getNearInfo(i int, ctx *context) error {
	if i > 0 {
		ctx.PrevPage = fmt.Sprintf(destFileName, i-1)
		ctx.PrevTitle = self.conf.Title[i-1]
	} else {
		// First Page
		ctx.PrevPage = ctx.HomePage
		ctx.PrevTitle = self.conf.HomeTitle
	}

	if i < len(self.conf.Title)-1 {
		ctx.NextPage = fmt.Sprintf(destFileName, i+1)
		ctx.NextTitle = self.conf.Title[i+1]
	} else {
		// Last Page
		ctx.NextPage = ctx.HomePage
		ctx.NextTitle = self.conf.HomeTitle
	}
	return nil
}

func (self *generator) doMarkDown(mdFileName string) (string, error) {
	cmd := exec.Command("markdown", mdFileName)
	out, err := cmd.StdoutPipe()
	if err != nil {
		return "", err
	}
	if err = cmd.Start(); err != nil {
		return "", err
	}
	rv, err := bufio.NewReader(out).ReadString(0)
	if err != nil && err != io.EOF {
		return "", err
	}
	return rv, cmd.Wait()
}
