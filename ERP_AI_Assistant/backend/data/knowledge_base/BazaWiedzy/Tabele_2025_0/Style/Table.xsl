<?xml version="1.0" encoding="windows-1250"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
<xsl:template match="ROOT">
<HTML>
<HEAD>
   <META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=windows-1250"></META>
   <META NAME="Author" CONTENT="Marek Sokolowski"></META>
   <LINK rel="stylesheet" type="text/css" href="Style/doc.css"></LINK>
   <SCRIPT LANGUAGE="JavaScript" SRC="script/div.js"></SCRIPT>
   <TITLE>Definicja tabeli <xsl:value-of select="./table/@name" /></TITLE>
</HEAD>
<BODY onload="initpage()">
  <xsl:apply-templates />
</BODY>
</HTML>
</xsl:template>

<xsl:template match="table">
  <P><DIV align="center"><H1><xsl:value-of select="./@name" />(<A href="Tbl.html#CDN.{./@name}">MSSQL</A>/<A href="PostgreSQL/Tbl.html#CDN.{./@name}">PostgreSQL</A>)</H1></DIV></P>
  <P><H3><xsl:value-of select="./@description" /></H3></P>
  <P>
  Prefiks: <B><xsl:value-of select="./@prefix" /></B>
  <BR/>
  Zadeklarowana w: <B>CDN_GLB<xsl:value-of select="./@glbx" /></B>
  <BR/>
  <xsl:if test="./@options!=''">Opcje: <B><xsl:value-of select="./@options" /></B></xsl:if>
  <BR/>
  <xsl:if test="./@aliases!=''">Aliasy: <B><xsl:value-of select="./@aliases" /></B></xsl:if>
  </P>
  <SPAN ID="Columns" CLASS="TabNoActive" onClick="divcolumns()" STYLE="cursor: hand"><xsl:text disable-output-escaping="yes">&amp;nbsp;&amp;nbsp;Kolumny&amp;nbsp;&amp;nbsp;</xsl:text></SPAN>
  <SPAN ID="Indexes" CLASS="TabNoActive" onClick="divindexes()" STYLE="cursor: hand"><xsl:text disable-output-escaping="yes">&amp;nbsp;&amp;nbsp;Indeksy&amp;nbsp;&amp;nbsp;</xsl:text></SPAN>
  <SPAN ID="Relations" CLASS="TabNoActive" onClick="divrelations()" STYLE="cursor: hand"><xsl:text disable-output-escaping="yes">&amp;nbsp;&amp;nbsp;Relacje&amp;nbsp;&amp;nbsp;</xsl:text></SPAN>
  <DIV CLASS="Tab">
  <DIV CLASS="TabOuter">
  <SPAN ID="Clarion" CLASS="TabNoActive" onClick="divclarion()" STYLE="cursor: hand"><xsl:text disable-output-escaping="yes">&amp;nbsp;&amp;nbsp;Clarion&amp;nbsp;&amp;nbsp;</xsl:text></SPAN>
  <SPAN ID="SQL" CLASS="TabNoActive" onClick="divsql()" STYLE="cursor: hand"><xsl:text disable-output-escaping="yes">&amp;nbsp;&amp;nbsp;MSSQL&amp;nbsp;&amp;nbsp;</xsl:text></SPAN>
  <SPAN ID="PSQL" CLASS="TabNoActive" onClick="divpsql()" STYLE="cursor: hand"><xsl:text disable-output-escaping="yes">&amp;nbsp;&amp;nbsp;PostgreSQL&amp;nbsp;&amp;nbsp;</xsl:text></SPAN>
  <xsl:apply-templates select="columns" />
  <xsl:apply-templates select="indexes" />
  <xsl:apply-templates select="relations" />
  </DIV></DIV>
</xsl:template>

<xsl:template match="columns" name="columns">
<DIV ID="clarioncolumns" STYLE="display: none" CLASS="Tab">
<DIV CLASS="TabInner">
<TABLE border="1" class="TableInfo">
     <TR>
       <TD><B>Nazwa</B></TD>
       <TD><B>Typ</B></TD>
       <TD><B>Opis</B></TD>
       <TD><B>Opcje</B></TD>
     </TR>
  <xsl:for-each select="./column|group|group/column">
     <TR>
       <TD><xsl:if test="../@clariontype='GROUP'"><xsl:text disable-output-escaping="yes">&amp;nbsp;&amp;nbsp;&amp;nbsp;</xsl:text></xsl:if>
       <xsl:if test="./@isinprimary='Yes'"><IMG alt="Kolumna zawarta w kluczu głównym tabeli (primary)" src="Img/Primary.gif"/></xsl:if>
       <xsl:choose>
         <xsl:when test="./@clariontype='GROUP'"><B><xsl:value-of select="./@clarionname" /></B></xsl:when>
         <xsl:otherwise><xsl:value-of select="./@clarionname" /></xsl:otherwise>
       </xsl:choose>
       </TD>
       <TD><xsl:value-of select="./@clariontype" /></TD>
       <TD><xsl:value-of select="./@description" /><BR/><I><xsl:value-of select="./@longdescription" /></I></TD>
       <TD>
         <xsl:value-of select="./@options" />
         <BR/>
       </TD>
     </TR>
   </xsl:for-each>
</TABLE>
</DIV></DIV>

<DIV ID="sqlcolumns" STYLE="display: none">
<DIV CLASS="TabInner">
<xsl:choose>
<xsl:when test="../@nosql='Yes'">
<B>Tabela nie istnieje w bazie SQL</B>
</xsl:when><xsl:otherwise>
<TABLE border="1" class="TableInfo">
     <TR>
       <TD><B>Nazwa</B></TD>
       <TD><B>Typ</B></TD>
       <TD><B>Opis</B></TD>
       <TD><B>Opcje</B></TD>
     </TR>
  <xsl:for-each select="./column|group/column">
    <xsl:if test="./@nosql!='Yes'">
     <TR>
       <TD>
       <xsl:if test="./@isinprimary='Yes'"><IMG alt="Kolumna zawarta w kluczu głównym tabeli (primary)" src="Img/Primary.gif"/></xsl:if>
       <xsl:value-of select="./@sqlname" />
       </TD>
       <TD><xsl:value-of select="./@sqltype" /></TD>
       <TD>
       <xsl:choose>
         <xsl:when test="../@clariontype='GROUP' and ./@description=''"><xsl:value-of select="../@description" /></xsl:when>
         <xsl:otherwise><xsl:value-of select="./@description" /></xsl:otherwise>
       </xsl:choose>
       <BR/><I><xsl:value-of select="./@longdescription" /></I></TD>
       <TD>
         <xsl:value-of select="./@options" />
         <BR/>
       </TD>
     </TR>
    </xsl:if>
   </xsl:for-each>
</TABLE>
</xsl:otherwise>
</xsl:choose>
</DIV></DIV>

<DIV ID="psqlcolumns" STYLE="display: none">
<DIV CLASS="TabInner">
<xsl:choose>
<xsl:when test="../@nosql='Yes'">
<B>Tabela nie istnieje w bazie SQL</B>
</xsl:when><xsl:otherwise>
<TABLE border="1" class="TableInfo">
     <TR>
       <TD><B>Nazwa</B></TD>
       <TD><B>Typ</B></TD>
       <TD><B>Opis</B></TD>
       <TD><B>Opcje</B></TD>
     </TR>
  <xsl:for-each select="./column|group/column">
    <xsl:if test="./@nosql!='Yes'">
     <TR>
       <TD>
       <xsl:if test="./@isinprimary='Yes'"><IMG alt="Kolumna zawarta w kluczu głównym tabeli (primary)" src="Img/Primary.gif"/></xsl:if>
       <xsl:value-of select="./@sqlname" />
       </TD>
       <TD><xsl:value-of select="./@psqltype" /></TD>
       <TD>
       <xsl:choose>
         <xsl:when test="../@clariontype='GROUP' and ./@description=''"><xsl:value-of select="../@description" /></xsl:when>
         <xsl:otherwise><xsl:value-of select="./@description" /></xsl:otherwise>
       </xsl:choose>
       <BR/><I><xsl:value-of select="./@longdescription" /></I></TD>
       <TD>
         <xsl:value-of select="./@options" />
         <BR/>
       </TD>
     </TR>
    </xsl:if>
   </xsl:for-each>
</TABLE>
</xsl:otherwise>
</xsl:choose>
</DIV></DIV>
</xsl:template>

<xsl:template match="indexes" name="indexes">
<DIV ID="clarionindexes" STYLE="display: none">
<DIV CLASS="TabInner">
<TABLE border="1" class="TableInfo">
     <TR>
       <TD><B>Nazwa</B></TD>
       <TD><B>Kolumny</B></TD>
       <TD><B>Opcje</B></TD>
       <TD><B>Opis</B></TD>
     </TR>
  <xsl:for-each select="./index">
     <TR>
       <TD>
         <xsl:if test="./@primary='Yes'"><IMG src="Img/Primary.gif"/></xsl:if>
         <xsl:value-of select="./@clarionname" />
       </TD>
       <TD>
       <xsl:for-each select="./indexcolumns/indexcolumn">
         <xsl:value-of select="./@clarionname" />
         <xsl:if test="not(last()=position())"><BR/></xsl:if>
       </xsl:for-each>
       </TD>
       <TD>
         <xsl:if test="./@primary='Yes'">PRIMARY </xsl:if>
         <xsl:if test="./@unique='Yes'">UNIQUE </xsl:if>
         <xsl:if test="./@casesensitive!='Yes'">NOCASE </xsl:if>
         <xsl:if test="./@autonum='Yes'">AUTONUM </xsl:if>
         <BR/>
       </TD>
       <TD>
         <xsl:if test="./@description=''"><BR/></xsl:if>
         <xsl:value-of select="./@description" />
       </TD>
     </TR>
   </xsl:for-each>
</TABLE>
</DIV></DIV>

<DIV ID="sqlindexes" STYLE="display: none">
<DIV CLASS="TabInner">
<xsl:choose>
<xsl:when test="../@nosql='Yes'">
<B>Tabela nie istnieje w bazie SQL</B>
</xsl:when><xsl:otherwise>
<TABLE border="1" class="TableInfo">
     <TR>
       <TD><B>Nazwa</B></TD>
       <TD><B>Kolumny</B></TD>
       <TD><B>Opcje</B></TD>
       <TD><B>Opis</B></TD>
     </TR>
  <xsl:for-each select="./index">
    <xsl:if test="./@nosql!='Yes'">
     <TR>
       <TD>
         <xsl:choose>
         <xsl:when test="./@primary='Yes'">
           <IMG src="Img/Primary.gif"/>
           <A href="Tbl.html#CDN.{../../@name}"><xsl:value-of select="./@sqlname" /></A>
         </xsl:when>
         <xsl:otherwise>
           <A href="Ndx.html#{./@sqlname}"><xsl:value-of select="./@sqlname" /></A>
         </xsl:otherwise>
         </xsl:choose>
       </TD>
       <TD>
       <xsl:for-each select="./indexcolumns/indexcolumn">
         <xsl:if test="./@nosql!='Yes'">
           <xsl:value-of select="./@sqlname" />
           <xsl:if test="not(last()=position())"><BR/></xsl:if>
         </xsl:if>
       </xsl:for-each>
       </TD>
       <TD>
         <xsl:if test="./@primary='Yes'">PRIMARY </xsl:if>
         <xsl:if test="./@unique='Yes'">UNIQUE </xsl:if>
         <BR/>
       </TD>
       <TD>
         <xsl:value-of select="./@description" />
         <BR/>
       </TD>
     </TR>
    </xsl:if>
   </xsl:for-each>
</TABLE>
</xsl:otherwise>
</xsl:choose>
</DIV></DIV>

<DIV ID="psqlindexes" STYLE="display: none">
<DIV CLASS="TabInner">
<xsl:choose>
<xsl:when test="../@nosql='Yes'">
<B>Tabela nie istnieje w bazie SQL</B>
</xsl:when><xsl:otherwise>
<TABLE border="1" class="TableInfo">
     <TR>
       <TD><B>Nazwa</B></TD>
       <TD><B>Kolumny</B></TD>
       <TD><B>Opcje</B></TD>
       <TD><B>Opis</B></TD>
     </TR>
  <xsl:for-each select="./index">
    <xsl:if test="./@nosql!='Yes'">
     <TR>
       <TD>
         <xsl:choose>
         <xsl:when test="./@primary='Yes'">
           <IMG src="Img/Primary.gif"/>
           <A href="Tbl.html#CDN.{../../@name}"><xsl:value-of select="./@sqlname" /></A>
         </xsl:when>
         <xsl:otherwise>
           <A href="Ndx.html#{./@sqlname}"><xsl:value-of select="./@sqlname" /></A>
         </xsl:otherwise>
         </xsl:choose>
       </TD>
       <TD>
       <xsl:for-each select="./indexcolumns/indexcolumn">
         <xsl:if test="./@nosql!='Yes'">
           <xsl:value-of select="./@sqlname" />
           <xsl:if test="not(last()=position())"><BR/></xsl:if>
         </xsl:if>
       </xsl:for-each>
       </TD>
       <TD>
         <xsl:if test="./@primary='Yes'">PRIMARY </xsl:if>
         <xsl:if test="./@unique='Yes'">UNIQUE </xsl:if>
         <BR/>
       </TD>
       <TD>
         <xsl:value-of select="./@description" />
         <BR/>
       </TD>
     </TR>
    </xsl:if>
   </xsl:for-each>
</TABLE>
</xsl:otherwise>
</xsl:choose>
</DIV></DIV>
</xsl:template>

<xsl:template match="relations" name="relations">
<DIV ID="clarionrelations" STYLE="display: none">
<DIV CLASS="TabInner">
<TABLE border="1" class="TableInfo">
     <TR>
       <TD><B>Typ</B></TD>
       <TD>
       <B>Ojciec</B><BR/>klucz główny
       </TD>
       <TD>
       <B>Dziecko</B><BR/>klucz obcy
       </TD>
       <TD><B>Pola łączące</B></TD>
       <TD><B>ON DELETE</B></TD>
       <TD><B>Warunek łączenia</B></TD>
       <TD><B>Opcje</B></TD>
     </TR>
  <xsl:for-each select="./relation">
     <TR>
       <TD>
       <xsl:value-of select="./@type" />
       </TD>
       <TD>
       <B><A href="{./@parentlink}.html"><xsl:value-of select="./@parent" /></A></B>
       <BR/>
       <xsl:value-of select="./@primaryname" />
       </TD>
       <TD>
       <B><A href="{./@childlink}.html"><xsl:value-of select="./@child" /></A></B>
       <BR/>
       <xsl:value-of select="./@foreignname" />
       </TD>
       <TD>
       <TABLE class="TableRelationInfo">
         <TD>
           <xsl:for-each select="./relationcolumn">
              <xsl:value-of select="./@parentname" /><BR/>
           </xsl:for-each>
         </TD>
         <TD>
           <xsl:for-each select="./relationcolumn">
             <xsl:value-of select="./@childname" /><BR/>
           </xsl:for-each>
         </TD>
       </TABLE>
       </TD>
       <TD>
         <xsl:value-of select="./@ondelete" />
         <BR/>
       </TD>
       <TD>
         <xsl:for-each select="./relationcolumn">
           <xsl:if test="not(./@parentname='')">
             <xsl:if test="position()!=1"> AND </xsl:if>
             <xsl:value-of select="./@parentname" />=<xsl:value-of select="./@childname" />
           </xsl:if>
         </xsl:for-each>
       </TD>
       <TD>
         <xsl:if test="./@setnull='Yes'">SQL_SETNULL<BR/></xsl:if>
         <xsl:if test="./@conditional!=''"><I>Warunkowa</I><BR/><xsl:value-of select="./@conditional" /></xsl:if>
         <BR/>
       </TD>
     </TR>
   </xsl:for-each>
</TABLE>
</DIV></DIV>

<DIV ID="sqlrelations" STYLE="display: none">
<DIV CLASS="TabInner">
<xsl:choose>
<xsl:when test="../@nosql='Yes'">
<B>Tabela nie istnieje w bazie SQL</B>
</xsl:when><xsl:otherwise>
<TABLE border="1" class="TableInfo">
     <TR>
       <TD><B>Typ</B></TD>
       <TD>
       <B>Ojciec</B><BR/>klucz główny<BR/><I>realizowana przez</I>
       </TD>
       <TD>
       <B>Dziecko</B><BR/>klucz obcy<BR/><I>realizowana przez</I>
       </TD>
       <TD><B>Pola łączące</B></TD>
       <TD><B>ON DELETE</B></TD>
       <TD><B>Warunek łączenia</B></TD>
       <TD><B>Opcje</B></TD>
     </TR>
  <xsl:for-each select="./relation">
    <xsl:if test="./@nosql!='Yes'">
     <TR>
       <TD>
       <xsl:value-of select="./@type" />
       </TD>
       <TD>
       <B><A href="{./@parentlink}.html"><xsl:value-of select="./@parent" /></A></B><BR/>
       <xsl:value-of select="./@primarysqlname" /><BR/>
       <I><A href="Fky.html#{./@parenthandler}"><xsl:value-of select="./@parenthandler" /></A></I>
       </TD>
       <TD>
       <B><A href="{./@childlink}.html"><xsl:value-of select="./@child" /></A></B><BR/>
       <xsl:value-of select="./@foreignsqlname" /><BR/>
       <I><A href="Fky.html#{./@childhandler}"><xsl:value-of select="./@childhandler" /></A></I>
       </TD>
       <TD>
       <TABLE class="TableRelationInfo">
         <TD>
           <xsl:for-each select="./relationcolumn">
              <xsl:value-of select="./@parentsqlname" /><BR/>
           </xsl:for-each>
         </TD>
         <TD>
           <xsl:for-each select="./relationcolumn">
             <xsl:value-of select="./@childsqlname" /><BR/>
           </xsl:for-each>
         </TD>
       </TABLE>
       </TD>
       <TD>
         <xsl:value-of select="./@ondelete" />
         <BR/>
       </TD>
       <TD>
         <xsl:for-each select="./relationcolumn">
           <xsl:if test="not(./@parentsqlname='')">
             <xsl:if test="position()!=1"> AND </xsl:if>
             <xsl:value-of select="./@parentsqlname" />=<xsl:value-of select="./@childsqlname" />
           </xsl:if>
         </xsl:for-each>
       </TD>
       <TD>
         <xsl:if test="./@setnull='Yes'">SQL_SETNULL<BR/></xsl:if>
         <xsl:if test="./@conditional!=''"><I>Warunkowa</I><BR/><xsl:value-of select="./@conditional" /></xsl:if>
         <BR/>
       </TD>
     </TR>
   </xsl:if>
   </xsl:for-each>
</TABLE>
</xsl:otherwise>
</xsl:choose>
</DIV></DIV>

<DIV ID="psqlrelations" STYLE="display: none">
<DIV CLASS="TabInner">
<xsl:choose>
<xsl:when test="../@nosql='Yes'">
<B>Tabela nie istnieje w bazie SQL</B>
</xsl:when><xsl:otherwise>
<TABLE border="1" class="TableInfo">
     <TR>
       <TD><B>Typ</B></TD>
       <TD>
       <B>Ojciec</B><BR/>klucz główny<BR/><I>realizowana przez</I>
       </TD>
       <TD>
       <B>Dziecko</B><BR/>klucz obcy<BR/><I>realizowana przez</I>
       </TD>
       <TD><B>Pola łączące</B></TD>
       <TD><B>ON DELETE</B></TD>
       <TD><B>Warunek łączenia</B></TD>
       <TD><B>Opcje</B></TD>
     </TR>
  <xsl:for-each select="./relation">
    <xsl:if test="./@nosql!='Yes'">
     <TR>
       <TD>
       <xsl:value-of select="./@type" />
       </TD>
       <TD>
       <B><A href="{./@parentlink}.html"><xsl:value-of select="./@parent" /></A></B><BR/>
       <xsl:value-of select="./@primarysqlname" /><BR/>
       <I><A href="Fky.html#{./@parenthandler}"><xsl:value-of select="./@parenthandler" /></A></I>
       </TD>
       <TD>
       <B><A href="{./@childlink}.html"><xsl:value-of select="./@child" /></A></B><BR/>
       <xsl:value-of select="./@foreignsqlname" /><BR/>
       <I><A href="Fky.html#{./@childhandler}"><xsl:value-of select="./@childhandler" /></A></I>
       </TD>
       <TD>
       <TABLE class="TableRelationInfo">
         <TD>
           <xsl:for-each select="./relationcolumn">
              <xsl:value-of select="./@parentsqlname" /><BR/>
           </xsl:for-each>
         </TD>
         <TD>
           <xsl:for-each select="./relationcolumn">
             <xsl:value-of select="./@childsqlname" /><BR/>
           </xsl:for-each>
         </TD>
       </TABLE>
       </TD>
       <TD>
         <xsl:value-of select="./@ondelete" />
         <BR/>
       </TD>
       <TD>
         <xsl:for-each select="./relationcolumn">
           <xsl:if test="not(./@parentsqlname='')">
             <xsl:if test="position()!=1"> AND </xsl:if>
             <xsl:value-of select="./@parentsqlname" />=<xsl:value-of select="./@childsqlname" />
           </xsl:if>
         </xsl:for-each>
       </TD>
       <TD>
         <xsl:if test="./@setnull='Yes'">SQL_SETNULL<BR/></xsl:if>
         <xsl:if test="./@conditional!=''"><I>Warunkowa</I><BR/><xsl:value-of select="./@conditional" /></xsl:if>
         <BR/>
       </TD>
     </TR>
   </xsl:if>
   </xsl:for-each>
</TABLE>
</xsl:otherwise>
</xsl:choose>
</DIV></DIV>
</xsl:template>

</xsl:stylesheet>
